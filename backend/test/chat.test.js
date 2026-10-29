const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { once } = require('node:events');
const { io } = require('socket.io-client');
const { createServer } = require('../app');
test('accounts, validation, private delivery, history and restart persistence', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'chat-test-'));
  const dataFile = path.join(dir, 'chat.json');
  let instance = createServer({ dataFile });
  const sockets = [];
  try {
    instance.server.listen(0, '127.0.0.1'); await once(instance.server, 'listening');
    let base = `http://127.0.0.1:${instance.server.address().port}`;
    let token = '';
    const request = async (url, body) => fetch(base + url, { method: body === undefined ? 'GET' : 'POST', headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}` }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    assert.equal((await request('/api/customers', {})).status, 400);
    assert.equal((await request('/api/customers')).status, 401);
    assert.equal((await request('/api/customers', { name: 'Short password', phone: '12345678', password: 'short' })).status, 400);
    const anonymous = io(base, { forceNew: true, reconnection: false });
    sockets.push(anonymous);
    const [connectionError] = await once(anonymous, 'connect_error');
    assert.match(connectionError.message, /sign in again/);
    sockets.pop().disconnect();
    const users = [];
    for (const [name, phone] of [['Alice & A', '11111111'], ['Bob', '22222222'], ['Carol', '33333333']]) {
      const response = await request('/api/customers', { name, phone, password: "test-password" });
      assert.equal(response.status, 201); const result = await response.json(); users.push({ ...result.customer, token: result.token });
    }
    assert.equal((await request('/api/customers', { name: 'Duplicate', phone: '11111111', password: 'test-password' })).status, 409);
    const login = await (await request('/api/customers/login', { phone: '11111111', password: 'test-password' })).json();
    assert.equal(login.customer._id, users[0]._id);
    token = login.token;
    assert.equal((await request('/api/customers/login', { phone: '11111111', password: 'wrong-password' })).status, 401);
    const listed = await (await request('/api/customers')).json();
    assert.equal(listed.length, 3);
    assert.equal(listed[0].passwordHash, undefined);
    assert.equal((await request(`/api/messages/customers/${users[1]._id}`)).status, 403);
    for (const user of users) {
      const socket = io(base, { transports: ['websocket'], forceNew: true, auth: { token: user.token } });
      sockets.push(socket); await once(socket, 'connect');
      assert.deepEqual(await socket.emitWithAck('join', user._id), { ok: true });
    }
    assert.deepEqual(await sockets[0].emitWithAck('join', users[1]._id), { error: 'Not authorized' });
    let leaked = false;
    sockets[2].on('receiveMessage', () => leaked = true);
    const a = once(sockets[0], 'receiveMessage'); const b = once(sockets[1], 'receiveMessage');
    assert.deepEqual(await sockets[0].emitWithAck('sendMessage', { sender: users[2]._id, receiver: users[1]._id, message: ' Hello Bob ' }), { ok: true });
    const [message] = await a; assert.deepEqual((await b)[0], message);
    assert.equal(message.sender, users[0]._id); assert.equal(message.message, 'Hello Bob');
    assert.ok((await sockets[0].emitWithAck('sendMessage', { receiver: users[1]._id, message: ' ' })).error);
    await new Promise(resolve => setTimeout(resolve, 100)); assert.equal(leaked, false);
    assert.equal((await (await request(`/api/messages/customers/${users[0]._id}?peer=${users[1]._id}`)).json()).length, 1);
    assert.deepEqual(await (await request(`/api/messages/customers/${users[0]._id}?peer=${users[2]._id}`)).json(), []);
    sockets.forEach(s => s.disconnect());
    await new Promise(resolve => instance.io.close(resolve));
    instance = createServer({ dataFile }); instance.server.listen(0, '127.0.0.1'); await once(instance.server, 'listening');
    base = `http://127.0.0.1:${instance.server.address().port}`;
    assert.equal((await request('/api/customers')).status, 401);
    const newLogin = await (await request('/api/customers/login', { phone: '11111111', password: 'test-password' })).json();
    token = newLogin.token;
    assert.equal((await (await request('/api/customers')).json()).length, 3);
    assert.equal((await (await request(`/api/messages/customers/${users[0]._id}`)).json()).length, 1);
  } finally {
    sockets.forEach(s => s.disconnect());
    await new Promise(resolve => instance.io.close(resolve));
    rmSync(dir, { recursive: true, force: true });
  }
});
