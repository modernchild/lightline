const express = require('express');
const db = require('../db/database');

const router = express.Router();

router.get('/conversations', (req, res) => {
  const feature = req.query.feature || null;
  res.json({ success: true, items: db.listConversations(req.user.id, feature) });
});

router.delete('/conversations/:id', (req, res) => {
  if (!db.deleteConversation(req.params.id, req.user.id)) {
    return res.status(404).json({ error: 'Conversation not found.' });
  }
  res.json({ success: true });
});

router.delete('/conversations/:id/messages', (req, res) => {
  if (!db.deleteConversationMessages(req.params.id, req.user.id)) {
    return res.status(404).json({ error: 'Conversation not found.' });
  }
  res.json({ success: true, message: 'Memory cleared for this conversation.' });
});

router.delete('/all', (req, res) => {
  db.deleteAllUserHistory(req.user.id);
  res.json({ success: true, message: 'All history and conversations removed.' });
});

router.get('/:id', (req, res) => {
  const item = db.getGeneration(req.params.id, req.user.id);
  if (!item) return res.status(404).json({ error: 'Not found.' });
  res.json({ success: true, item });
});

router.delete('/:id', (req, res) => {
  if (!db.deleteGeneration(req.params.id, req.user.id)) {
    return res.status(404).json({ error: 'Not found.' });
  }
  res.json({ success: true });
});

router.get('/', (req, res) => {
  const feature = req.query.feature || null;
  res.json({ success: true, items: db.listGenerations(req.user.id, { feature }) });
});

module.exports = router;
