const router = require('express').Router();
const { hashPassword, verifyPassword, publicUser, requireUser } = require('../auth');
const cleanPhone = value => typeof value === 'string' ? value.replace(/[\s()-]/g, '') : '';
router.post('/login', async (req, res) => {
  const phone = cleanPhone(req.body?.phone);
  const password = req.body?.password;
  if (typeof password !== 'string' || password.length > 128) return res.status(400).json({ message: 'Enter your phone number and password.' });
  const customer = req.app.locals.store.data.customers.find(c => c.phone === phone);
  // Run the derivation even for unknown accounts to avoid a cheap account-existence probe.
  const valid = await verifyPassword(password, customer?.passwordHash || '00000000000000000000000000000000:' + '00'.repeat(64));
  if (!customer || !valid) return res.status(401).json({ message: 'Phone number or password is incorrect.' });
  res.json(req.app.locals.auth.issue(customer));
});
router.post('/logout', requireUser, (req, res) => {
  req.app.locals.auth.revoke(req.token);
  req.app.locals.io.in(req.user._id).disconnectSockets(true);
  res.json({ ok: true });
});
router.post('/', async (req, res) => {
  const store = req.app.locals.store;
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const phone = cleanPhone(req.body?.phone);
  const password = req.body?.password;
  if (!name || name.length > 100 || !/^\+?\d{7,15}$/.test(phone)) return res.status(400).json({ message: 'Enter your name and a valid phone number (7–15 digits).' });
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) return res.status(400).json({ message: 'Use a password between 8 and 128 characters.' });
  const passwordHash = await hashPassword(password);
  if (store.data.customers.some(c => c.phone === phone)) return res.status(409).json({ message: 'This phone number is already registered. Please sign in.' });
  const customer = { _id: store.id(), name, phone, passwordHash };
  store.data.customers.push(customer);
  try { store.save(); } catch (error) { store.data.customers.pop(); throw error; }
  res.status(201).json(req.app.locals.auth.issue(customer));
});
router.use(requireUser);
router.get('/', (req, res) => res.json(req.app.locals.store.data.customers.map(publicUser)));
router.get('/:id', (req, res) => {
  const customer = req.app.locals.store.data.customers.find(c => c._id === req.params.id);
  res.status(customer ? 200 : 404).json(customer ? publicUser(customer) : { message: 'User not found' });
});
module.exports = router;
