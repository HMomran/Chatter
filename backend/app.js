const express = require('express');
const cors = require('cors');
const http = require('node:http');
const path = require('node:path');
const { Server } = require('socket.io');
const { createStore } = require('./store');
const { createAuth } = require('./auth');
function createServer(options = {}) {
  const store = createStore(options.dataFile || process.env.DATA_FILE || path.join(__dirname, 'data/chat.json'));
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '32kb' }));
  app.locals.store = store;
  const auth = createAuth(store);
  app.locals.auth = auth;
  app.get('/', (_req, res) => res.json({ status: 'ok', service: 'Chat backend' }));
  app.use('/api/customers', require('./routes/customers'));
  app.use('/api/messages', require('./routes/messages'));
  app.use((err, _req, res, _next) => res.status(err.status || 500).json({ message: err.status === 400 ? 'Invalid JSON' : 'Server error' }));
  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: process.env.FRONTEND_ORIGIN || 'http://localhost:4200' } });
  app.locals.io = io;
  io.use((socket, next) => {
    const user = auth.user(socket.handshake.auth?.token);
    if (!user) return next(new Error('Your session has ended. Please sign in again.'));
    socket.data.userId = user._id;
    next();
  });
  io.on('connection', socket => {
    socket.join(socket.data.userId);
    socket.on('join', (id, ack = () => {}) => {
      if (socket.data.userId !== id) return ack({ error: 'Not authorized' });
      if (socket.data.userId) socket.leave(socket.data.userId);
      socket.data.userId = id;
      socket.join(id);
      ack({ ok: true });
    });
    socket.on('sendMessage', (input, ack = () => {}) => {
      if (!auth.user(socket.handshake.auth?.token)) return ack({ error: 'Your session has ended. Please sign in again.' });
      const sender = socket.data.userId;
      const receiver = input?.receiver;
      const message = typeof input?.message === 'string' ? input.message.trim() : '';
      if (!sender || !store.data.customers.some(c => c._id === receiver) || !message || message.length > 4000) return ack({ error: 'Choose a valid recipient and enter 1–4000 characters.' });
      const msg = { _id: store.id(), sender, receiver, message, timestamp: new Date().toISOString() };
      try { store.data.messages.push(msg); store.save(); }
      catch { store.data.messages.pop(); return ack({ error: 'Could not save message.' }); }
      io.to(sender).to(receiver).emit('receiveMessage', msg);
      ack({ ok: true });
    });
  });
  return { app, server, io };
}
if (require.main === module) {
  const { server } = createServer();
  server.on('error', error => { console.error(error.message); process.exit(1); });
  server.listen(process.env.PORT || 3000, () => console.log('Chat backend: http://localhost:' + (process.env.PORT || 3000)));
}
module.exports = { createServer };
