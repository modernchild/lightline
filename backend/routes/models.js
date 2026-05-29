const express = require('express');
const { testModel } = require('../services/openrouter');
const { FEATURE_MODELS, listAllModels, getModelChainForFeature } = require('../config/models');

const router = express.Router();

router.get('/', (req, res) => {
  const features = Object.entries(FEATURE_MODELS).map(([feature, cfg]) => ({
    feature,
    primary: cfg.primary,
    fallback: cfg.fallback,
    chain: getModelChainForFeature(feature),
    maxTokens: cfg.maxTokens,
  }));
  res.json({ success: true, models: listAllModels(), features });
});

router.post('/test', async (req, res) => {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({ error: 'OPENROUTER_API_KEY not set.' });
    }

    const toTest = req.body?.models;
    const ids = toTest?.length
      ? toTest
      : [...new Set(
          Object.values(FEATURE_MODELS).flatMap(c => [c.primary, c.fallback])
        )];

    const results = [];
    for (const model of ids) {
      results.push(await testModel(model));
    }

    const passed = results.filter(r => r.ok).length;
    res.json({
      success: true,
      summary: { total: results.length, passed, failed: results.length - passed },
      results,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
