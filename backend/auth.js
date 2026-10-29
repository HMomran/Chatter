const { randomBytes, scrypt: derive, timingSafeEqual } = require('node:crypto');
const { promisify } = require('node:util');
const scrypt = promisify(derive);
async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  return salt + ':' + (await scrypt(password, salt, 64)).toString('hex');
}
async function verifyPassword(password, hash) {
  if (!hash) return false;
  const [salt, key] = hash.split(':');
  const actual = await scrypt(password, salt, 64);
  const expected = Buffer.from(key, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
const publicUser = ({ _id, name, phone }) => ({ _id, name, phone });
function createAuth(store) {
  const sessions = new Map();
  return {
    issue(user) {
      const token = randomBytes(32).toString('hex');
      for (const [key, session] of sessions) if (session.expires < Date.now()) sessions.delete(key);
      sessions.set(token, { userId: user._id, expires: Date.now() + 24 * 60 * 60 * 1000 });
      return { customer: publicUser(user), token };
    },
    user(token) {
      const session = sessions.get(token);
      if (!session || session.expires < Date.now()) { sessions.delete(token); return null; }
      return store.data.customers.find(c => c._id === session.userId) || null;
    },
    revoke(token) { sessions.delete(token); }
  };
}
function requireUser(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer /, '');
  const user = req.app.locals.auth.user(token);
  if (!user) return res.status(401).json({ message: 'Your session has ended. Please sign in again.' });
  req.user = user; req.token = token; next();
}
module.exports = { hashPassword, verifyPassword, publicUser, createAuth, requireUser };
