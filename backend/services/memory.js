// ─────────────────────────────────────────────
// services/memory.js
// Conversational memory per user + feature
// ─────────────────────────────────────────────

const db = require('../db/database');

const MAX_HISTORY_MESSAGES = 12;

function resolveConversation(userId, feature, conversationId, titleHint) {
  if (conversationId) {
    const existing = db.getConversation(conversationId, userId);
    if (existing) return existing;
  }
  return db.createConversation(userId, feature, titleHint || `${feature} session`);
}

function loadHistory(conversationId) {
  if (!conversationId) return [];
  return db.getConversationHistory(conversationId, MAX_HISTORY_MESSAGES);
}

function persistTurn(conversationId, userPrompt, assistantContent) {
  if (!conversationId) return;
  db.addMessage(conversationId, 'user', userPrompt);
  db.addMessage(conversationId, 'assistant', assistantContent);
}

module.exports = {
  resolveConversation,
  loadHistory,
  persistTurn,
  MAX_HISTORY_MESSAGES,
};
