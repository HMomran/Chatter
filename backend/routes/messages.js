const router = require('express').Router();
router.use(require('../auth').requireUser);
router.get('/customers/:id', (req, res) => {
  const { id } = req.params;
  if (id !== req.user._id) return res.status(403).json({ message: 'Not authorized' });
  const peer = req.query.peer;
  res.json(req.app.locals.store.data.messages.filter(m => peer
    ? (m.sender === id && m.receiver === peer) || (m.sender === peer && m.receiver === id)
    : m.sender === id || m.receiver === id));
});
module.exports = router;
