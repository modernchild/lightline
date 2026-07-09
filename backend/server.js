// ─────────────────────────────────────────────
// Lightline Backend — server.js
// Main Express application entry point
// ─────────────────────────────────────────────

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const generateRoutes = require('./routes/generate');
const historyRoutes = require('./routes/history');
const modelsRoutes = require('./routes/models');
const { initDatabase } = require('./db/database');
const { initPinecone } = require('./services/pinecone');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// ── CORS ──────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body parsing ──────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Global rate limiting ──────────────────────
// Prevents abuse — 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'You\'ve made too many requests. Please wait a few minutes and try again.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// ── Stricter limiter for AI generation ────────
// AI calls are expensive — 20 per 15 min per IP
const generateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'You\'ve used your generation limit for now. Please wait a few minutes before generating more content.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Routes ─────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Lightline Backend',
    ai: 'openrouter',
    timestamp: new Date().toISOString(),
  });
});

// Public — no auth required
app.use('/api/auth', authRoutes);

// Protected — JWT required
app.use('/api/generate', authenticateToken, generateLimiter, generateRoutes);
app.use('/api/history', authenticateToken, historyRoutes);
app.use('/api/models', authenticateToken, modelsRoutes);

// ── 404 handler ────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `The endpoint you're looking for doesn't exist. Please check the URL and try again.` });
});

// ── Global error handler ───────────────────────
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  const status = err.status || 500;
  res.status(status).json({
    error: status === 500 ? 'Something went wrong on our end. Please try again.' : (err.message || 'An unexpected error occurred.'),
  });
});

// ── Start ──────────────────────────────────────
initDatabase();

app.listen(PORT, async () => {
  console.log(`✅ Lightline backend running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV}`);
  console.log(`   Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`   OpenRouter: ${process.env.OPENROUTER_API_KEY ? 'configured' : 'MISSING — set OPENROUTER_API_KEY'}`);
  await initPinecone();
});
