// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// config/models.js
// OpenRouter model routing per Lightline feature
// https://openrouter.ai/docs#models
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// Global fallback when both primary and feature fallback fail
const GLOBAL_FALLBACK = process.env.OPENROUTER_GLOBAL_FALLBACK || 'meta-llama/llama-3.3-70b-instruct';

const FEATURE_MODELS = {
  sermon: {
    primary: 'meta-llama/llama-3.3-70b-instruct',
    fallback: 'anthropic/claude-sonnet-4',
    maxTokens: 3000,
  },
  devotional: {
    primary: 'meta-llama/llama-3.3-70b-instruct',
    fallback: 'anthropic/claude-sonnet-4',
    maxTokens: 1500,
  },
  whatsapp: {
    primary: 'openai/gpt-4o',
    fallback: 'openai/gpt-4-turbo',
    maxTokens: 1000,
  },
  social: {
    primary: 'meta-llama/llama-3.3-70b-instruct',
    fallback: 'meta-llama/llama-3.1-70b-instruct',
    maxTokens: 1500,
  },
  'bible-study': {
    primary: 'meta-llama/llama-3.3-70b-instruct',
    fallback: 'anthropic/claude-sonnet-4',
    maxTokens: 2500,
  },
  prayer: {
    primary: 'meta-llama/llama-3.3-70b-instruct',
    fallback: 'anthropic/claude-sonnet-4',
    maxTokens: 1200,
  },
  evangelism: {
    primary: 'meta-llama/llama-3.3-70b-instruct',
    fallback: 'anthropic/claude-sonnet-4',
    maxTokens: 2000,
  },
  evaluation: {
    primary: 'openai/gpt-4o-mini',
    fallback: 'anthropic/claude-3-haiku',
    maxTokens: 500,
  },
};

const EMBEDDING_MODEL = 'openai/text-embedding-3-small';

function getModelsForFeature(feature) {
  const config = FEATURE_MODELS[feature] || FEATURE_MODELS.sermon;
  return { ...config, globalFallback: GLOBAL_FALLBACK };
}

function getModelChainForFeature(feature) {
  const { primary, fallback, globalFallback } = getModelsForFeature(feature);
  const chain = [primary, fallback];
  if (globalFallback && !chain.includes(globalFallback)) chain.push(globalFallback);
  return chain;
}

function listAllModels() {
  const seen = new Set();
  const models = [];
  for (const [feature, cfg] of Object.entries(FEATURE_MODELS)) {
    for (const key of ['primary', 'fallback']) {
      const id = cfg[key];
      if (!seen.has(id)) {
        seen.add(id);
        models.push({ id, usedBy: [feature] });
      } else {
        models.find(m => m.id === id).usedBy.push(feature);
      }
    }
  }
  return models;
}

module.exports = {
  FEATURE_MODELS,
  EMBEDDING_MODEL,
  GLOBAL_FALLBACK,
  getModelsForFeature,
  getModelChainForFeature,
  listAllModels,
};
