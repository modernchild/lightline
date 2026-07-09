// routes/generate.js — OpenRouter, streaming, RAG, memory, evaluation, history

const express = require('express');
const { generate, generateStream } = require('../services/openrouter');
const { queryMinistryContext } = require('../services/pinecone');
const { evaluateContent } = require('../services/evaluation');
const memory = require('../services/memory');
const db = require('../db/database');
const prompts = require('../services/prompts');

const router = express.Router();

const FEATURE_MAP = {
  'sermon/quick': 'sermon',
  'sermon/deep': 'sermon',
  devotional: 'devotional',
  whatsapp: 'whatsapp',
  'bible-study': 'bible-study',
  social: 'social',
  prayer: 'prayer',
  evangelism: 'evangelism',
};

async function fetchRagContext(ragQuery) {
  if (!ragQuery) return null;
  const results = await queryMinistryContext(ragQuery, 3);
  if (!results.length) return null;
  return results.map(r => `[${r.source}]\n${r.text}`).join('\n\n');
}

function sendSse(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

async function runGeneration({
  req,
  res,
  feature,
  promptData,
  ragQuery,
  title,
  input,
  maxTokens,
  useRag = true,
}) {
  const {
    stream = false,
    useMemory = false,
    conversationId: reqConvId,
    evaluate = true,
  } = req.body;

  const userId = req.user.id;
  let conversationId = reqConvId;

  if (useMemory) {
    const conv = memory.resolveConversation(userId, feature, conversationId, title);
    conversationId = conv.id;
  }

  const history = useMemory ? memory.loadHistory(conversationId) : [];
  const ragContext = useRag ? await fetchRagContext(ragQuery) : null;

  if (stream) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    let fullContent = '';
    let modelUsed = null;
    let fallbackUsed = false;

    try {
      for await (const chunk of generateStream({
        feature,
        system: promptData.system,
        user: promptData.user,
        ragContext,
        history,
        maxTokens,
      })) {
        if (chunk.type === 'chunk') {
          fullContent += chunk.content;
          modelUsed = chunk.model;
          sendSse(res, 'chunk', { content: chunk.content });
        } else if (chunk.type === 'done') {
          modelUsed = chunk.model;
          fallbackUsed = chunk.fallbackUsed;
        } else if (chunk.type === 'error') {
          sendSse(res, 'error', { error: chunk.message });
          return res.end();
        }
      }

      const saved = db.saveGeneration({
        userId,
        feature,
        title,
        input,
        content: fullContent,
        model: modelUsed,
        ragUsed: !!ragContext,
        fallbackUsed,
        streamUsed: true,
        conversationId: useMemory ? conversationId : null,
      });

      if (useMemory) memory.persistTurn(conversationId, promptData.user, fullContent);

      let evaluation = null;
      if (evaluate) {
        evaluation = await evaluateContent({
          feature,
          userPrompt: promptData.user,
          content: fullContent,
          generationId: saved.id,
          userId,
        });
      }

      sendSse(res, 'done', {
        success: true,
        content: fullContent,
        model: modelUsed,
        ragUsed: !!ragContext,
        fallbackUsed,
        conversationId: useMemory ? conversationId : null,
        generationId: saved.id,
        evaluation,
      });
      return res.end();
    } catch (err) {
      sendSse(res, 'error', { error: err.message });
      return res.end();
    }
  }

  const result = await generate({
    feature,
    system: promptData.system,
    user: promptData.user,
    ragContext,
    history,
    maxTokens,
  });

  const saved = db.saveGeneration({
    userId,
    feature,
    title,
    input,
    content: result.content,
    model: result.model,
    ragUsed: !!ragContext,
    fallbackUsed: result.fallbackUsed,
    streamUsed: false,
    conversationId: useMemory ? conversationId : null,
  });

  if (useMemory) memory.persistTurn(conversationId, promptData.user, result.content);

  let evaluation = null;
  if (evaluate) {
    evaluation = await evaluateContent({
      feature,
      userPrompt: promptData.user,
      content: result.content,
      generationId: saved.id,
      userId,
    });
  }

  return res.json({
    success: true,
    content: result.content,
    model: result.model,
    ragUsed: !!ragContext,
    fallbackUsed: result.fallbackUsed,
    conversationId: useMemory ? conversationId : null,
    generationId: saved.id,
    evaluation,
    timestamp: new Date().toISOString(),
  });
}

function wrap(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (err) {
      console.error('[Generate Error]', err.message);
      if (res.headersSent) {
        sendSse(res, 'error', { error: err.message });
        return res.end();
      }
      res.status(500).json({ error: err.message || 'Generation didn\'t complete successfully. Please try again.' });
    }
  };
}

router.post('/sermon/quick', wrap(async (req, res) => {
  const { topic, scripture, occasion, duration, context } = req.body;
  if (!topic) return res.status(400).json({ error: 'Please enter a sermon topic or scripture reference.' });
  const promptData = prompts.sermonQuick({ topic, scripture, occasion, duration, context });
  await runGeneration({
    req, res, feature: 'sermon',
    promptData,
    ragQuery: `${topic} ${scripture || ''} sermon`.trim(),
    title: topic,
    input: req.body,
    maxTokens: 3000,
  });
}));

router.post('/sermon/deep', wrap(async (req, res) => {
  const { step, topic, scripture, occasion, previousSteps } = req.body;
  if (!topic || !step) return res.status(400).json({ error: 'Please enter a sermon topic and select a step.' });
  const promptData = prompts.sermonDeepStep({ step, topic, scripture, occasion, previousSteps });
  await runGeneration({
    req, res, feature: 'sermon',
    promptData,
    ragQuery: `${topic} ${scripture || ''} ${step}`.trim(),
    title: `${topic} — ${step}`,
    input: req.body,
    maxTokens: 3000,
  });
}));

router.post('/devotional', wrap(async (req, res) => {
  const { topic, scripture, audience, length } = req.body;
  if (!topic) return res.status(400).json({ error: 'Please enter a devotional topic.' });
  const promptData = prompts.devotional({ topic, scripture, audience, length });
  await runGeneration({
    req, res, feature: 'devotional',
    promptData,
    ragQuery: `${topic} ${scripture || ''} devotional`.trim(),
    title: topic,
    input: req.body,
    maxTokens: 1500,
  });
}));

router.post('/whatsapp', wrap(async (req, res) => {
  const { topic, purpose, audience, tone } = req.body;
  if (!topic) return res.status(400).json({ error: 'Please enter a topic for your WhatsApp message.' });
  const promptData = prompts.whatsapp({ topic, purpose, audience, tone });
  await runGeneration({
    req, res, feature: 'whatsapp',
    promptData,
    ragQuery: null,
    title: topic,
    input: req.body,
    maxTokens: 1000,
    useRag: false,
  });
}));

router.post('/bible-study', wrap(async (req, res) => {
  const { passage, theme, sessions, audience } = req.body;
  if (!passage) return res.status(400).json({ error: 'Please enter a Bible passage to study.' });
  const promptData = prompts.bibleStudy({ passage, theme, sessions, audience });
  await runGeneration({
    req, res, feature: 'bible-study',
    promptData,
    ragQuery: `${passage} ${theme || ''} bible study`.trim(),
    title: passage,
    input: req.body,
    maxTokens: 2500,
  });
}));

router.post('/social', wrap(async (req, res) => {
  const { topic, scripture, platform, count } = req.body;
  if (!topic) return res.status(400).json({ error: 'Please enter a topic for your social media post.' });
  const promptData = prompts.socialMedia({ topic, scripture, platform, count });
  await runGeneration({
    req, res, feature: 'social',
    promptData,
    ragQuery: `${topic} social media ministry`.trim(),
    title: topic,
    input: req.body,
    maxTokens: 1500,
  });
}));

router.post('/prayer', wrap(async (req, res) => {
  const { topic, type, audience, length } = req.body;
  if (!topic) return res.status(400).json({ error: 'Please enter a topic for your prayer.' });
  const promptData = prompts.prayer({ topic, type, audience, length });
  await runGeneration({
    req, res, feature: 'prayer',
    promptData,
    ragQuery: `${topic} prayer`.trim(),
    title: topic,
    input: req.body,
    maxTokens: 1200,
  });
}));

router.post('/evangelism', wrap(async (req, res) => {
  const promptData = prompts.evangelism(req.body);
  await runGeneration({
    req, res, feature: 'evangelism',
    promptData,
    ragQuery: 'gospel evangelism salvation',
    title: 'Evangelism',
    input: req.body,
    maxTokens: 2000,
  });
}));

module.exports = router;
