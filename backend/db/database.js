// db/database.js
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const DB_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DB_DIR, 'lightline-history.json');
const EMPTY_DB = { conversations: [], messages: [], generations: [], evaluations: [] };
function ensureDb() {
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify(EMPTY_DB, null, 2));
}
function readDb() {
  ensureDb();
  try { return { ...EMPTY_DB, ...JSON.parse(fs.readFileSync(DB_FILE, 'utf8')) }; }
  catch { return { ...EMPTY_DB }; }
}
function writeDb(db) { ensureDb(); fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2)); }
function createConversation(userId, feature, title = 'New conversation') {
  const db = readDb();
  const conv = { id: uuidv4(), userId, feature, title: title.slice(0, 120), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  db.conversations.push(conv); writeDb(db); return conv;
}
function getConversation(id, userId) { return readDb().conversations.find(c => c.id === id && c.userId === userId) || null; }
function listConversations(userId, feature = null) {
  return readDb().conversations.filter(c => c.userId === userId && (!feature || c.feature === feature)).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}
function deleteConversation(id, userId) {
  const db = readDb();
  if (!db.conversations.some(c => c.id === id && c.userId === userId)) return false;
  db.conversations = db.conversations.filter(c => !(c.id === id && c.userId === userId));
  db.messages = db.messages.filter(m => m.conversationId !== id);
  writeDb(db); return true;
}
function addMessage(conversationId, role, content) {
  const db = readDb();
  db.messages.push({ id: uuidv4(), conversationId, role, content, createdAt: new Date().toISOString() });
  writeDb(db);
  const conv = db.conversations.find(c => c.id === conversationId);
  if (conv) { conv.updatedAt = new Date().toISOString(); writeDb(db); }
}
function getConversationHistory(conversationId, limit = 12) {
  return readDb().messages.filter(m => m.conversationId === conversationId).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).slice(-limit).map(m => ({ role: m.role, content: m.content }));
}
function deleteConversationMessages(conversationId, userId) {
  if (!getConversation(conversationId, userId)) return false;
  const db = readDb(); db.messages = db.messages.filter(m => m.conversationId !== conversationId); writeDb(db); return true;
}
function saveGeneration(record) {
  const db = readDb();
  const gen = { id: uuidv4(), userId: record.userId, feature: record.feature, title: (record.title || record.feature).slice(0, 120), input: record.input || {}, content: record.content, model: record.model, ragUsed: !!record.ragUsed, fallbackUsed: !!record.fallbackUsed, streamUsed: !!record.streamUsed, conversationId: record.conversationId || null, createdAt: new Date().toISOString() };
  db.generations.push(gen); writeDb(db); return gen;
}
function listGenerations(userId, opts = {}) {
  const { feature, limit = 50 } = opts;
  return readDb().generations.filter(g => g.userId === userId && (!feature || g.feature === feature)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, limit).map(g => ({ id: g.id, feature: g.feature, title: g.title, model: g.model, ragUsed: g.ragUsed, createdAt: g.createdAt, preview: (g.content || '').slice(0, 200) }));
}
function getGeneration(id, userId) {
  const db = readDb();
  const gen = db.generations.find(g => g.id === id && g.userId === userId);
  if (!gen) return null;
  return { ...gen, evaluation: db.evaluations.find(e => e.generationId === id) || null };
}
function deleteGeneration(id, userId) {
  const db = readDb();
  if (!db.generations.some(g => g.id === id && g.userId === userId)) return false;
  db.generations = db.generations.filter(g => !(g.id === id && g.userId === userId));
  db.evaluations = db.evaluations.filter(e => e.generationId !== id);
  writeDb(db); return true;
}
function deleteAllUserHistory(userId) {
  const db = readDb();
  const convIds = db.conversations.filter(c => c.userId === userId).map(c => c.id);
  const genIds = db.generations.filter(g => g.userId === userId).map(g => g.id);
  db.conversations = db.conversations.filter(c => c.userId !== userId);
  db.messages = db.messages.filter(m => !convIds.includes(m.conversationId));
  db.generations = db.generations.filter(g => g.userId !== userId);
  db.evaluations = db.evaluations.filter(e => !genIds.includes(e.generationId));
  writeDb(db); return true;
}
function saveEvaluation(data) {
  const db = readDb();
  db.evaluations = db.evaluations.filter(e => e.generationId !== data.generationId);
  db.evaluations.push({ id: uuidv4(), ...data, overall: data.scores.overall, createdAt: new Date().toISOString() });
  writeDb(db);
}
function initDatabase() { ensureDb(); console.log('History DB:', DB_FILE); }
module.exports = { initDatabase, createConversation, getConversation, listConversations, deleteConversation, addMessage, getConversationHistory, deleteConversationMessages, saveGeneration, listGenerations, getGeneration, deleteGeneration, deleteAllUserHistory, saveEvaluation };
