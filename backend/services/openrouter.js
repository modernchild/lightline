// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// services/openrouter.js
// OpenRouter API â€” multi-model routing, streaming, fallbacks
// https://openrouter.ai/docs/api/reference
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const { getModelsForFeature, getModelChainForFeature } = require('../config/models');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_EMBED_URL = 'https://openrouter.ai/api/v1/embeddings';

function getApiKey() {
  let key = (process.env.OPENROUTER_API_KEY || '').trim();
  if (!key) {
    throw new Error('OPENROUTER_API_KEY is not set in backend/.env');
  }
  // Common copy-paste typo: extra "s" â†’ OpenRouter returns 401 "Missing Authentication header"
  if (key.startsWith('ssk-or-v1-')) {
    console.warn('[OpenRouter] OPENROUTER_API_KEY starts with "ssk-or-v1" â€” using "sk-or-v1" instead. Fix backend/.env when you can.');
    key = key.slice(1);
  }
  if (!key.startsWith('sk-or-v1-') && !key.startsWith('sk-')) {
    throw new Error(
      'OPENROUTER_API_KEY looks invalid. Keys from https://openrouter.ai/keys start with sk-or-v1-'
    );
  }
  return key;
}

function buildHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getApiKey()}`,
    'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
    'X-Title': 'Lightline Ministry Companion',
  };
}

/**
 * Build messages array with optional conversation history.
 */
function buildMessages({ system, user, ragContext, history = [] }) {
  const userContent = ragContext
    ? `[Relevant Ministry Context from Knowledge Base]\n${ragContext}\n\n---\n\n${user}`
    : user;

  const messages = [{ role: 'system', content: system }];

  for (const msg of history) {
    if (msg.role === 'user' || msg.role === 'assistant') {
      messages.push({ role: msg.role, content: msg.content });
    }
  }

  messages.push({ role: 'user', content: userContent });
  return messages;
}

/**
 * Non-streaming completion with automatic fallback.
 */
async function generate({
  feature,
  system,
  user,
  ragContext,
  history = [],
  maxTokens,
}) {
  const { primary, fallback, maxTokens: defaultMax } = getModelsForFeature(feature);
  const tokens = maxTokens || defaultMax;
  const messages = buildMessages({ system, user, ragContext, history });

  const modelChain = getModelChainForFeature(feature);

  let lastError;
  for (const model of modelChain) {
    try {
      const res = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify({
          model,
          messages,
          max_tokens: tokens,
          temperature: 0.7,
        }),
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`We couldn't reach the AI service. Please try again in a moment.`);
      }

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content;
      if (!text) throw new Error('The AI service returned an incomplete response. Please try again.');

      return {
        content: text,
        model,
        usage: data.usage || null,
        fallbackUsed: model !== primary,
      };
    } catch (err) {
      lastError = err;
      console.warn(`[OpenRouter] Model ${model} failed for ${feature}:`, err.message);
    }
  }

  throw lastError || new Error('All models failed.');
}

/**
 * Streaming completion â€” yields text chunks via async generator.
 */
async function* generateStream({
  feature,
  system,
  user,
  ragContext,
  history = [],
  maxTokens,
}) {
  const { primary, fallback, maxTokens: defaultMax } = getModelsForFeature(feature);
  const tokens = maxTokens || defaultMax;
  const messages = buildMessages({ system, user, ragContext, history });

  const modelChain = getModelChainForFeature(feature);

  let lastError;
  for (const model of modelChain) {
    try {
      const res = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify({
          model,
          messages,
          max_tokens: tokens,
          temperature: 0.7,
          stream: true,
        }),
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`OpenRouter ${res.status}: ${errBody}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;
          const payload = trimmed.slice(6);
          if (payload === '[DONE]') continue;

          try {
            const parsed = JSON.parse(payload);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              yield { type: 'chunk', content: delta, model };
            }
          } catch {
            // skip malformed SSE lines
          }
        }
      }

      yield { type: 'done', model, fallbackUsed: model !== primary };
      return;
    } catch (err) {
      lastError = err;
      console.warn(`[OpenRouter Stream] Model ${model} failed:`, err.message);
    }
  }

  yield { type: 'error', message: lastError?.message || 'All models failed.' };
}

/**
 * Quick ping to verify a model is reachable.
 */
async function testModel(modelId) {
  const start = Date.now();
  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({
      model: modelId,
      messages: [{ role: 'user', content: 'Reply with exactly: OK' }],
      max_tokens: 10,
    }),
  });

  const elapsed = Date.now() - start;
  if (!res.ok) {
    const err = await res.text();
    return { model: modelId, ok: false, error: err, elapsedMs: elapsed };
  }

  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content?.trim() || '';
  return {
    model: modelId,
    ok: true,
    reply: reply.slice(0, 100),
    elapsedMs: elapsed,
    usage: data.usage,
  };
}

/**
 * Generate embedding vector via OpenRouter.
 */
async function generateEmbedding(text) {
  const model = process.env.OPENROUTER_EMBEDDING_MODEL || 'openai/text-embedding-3-small';

  const res = await fetch(OPENROUTER_EMBED_URL, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({
      model,
      input: text.slice(0, 8000),
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Embedding failed: ${err}`);
  }

  const data = await res.json();
  const vector = data.data?.[0]?.embedding;
  if (!vector?.length) {
    throw new Error('No embedding returned.');
  }
  return vector;
}

module.exports = {
  generate,
  generateStream,
  testModel,
  generateEmbedding,
  buildMessages,
};
