// ─────────────────────────────────────────────
// services/evaluation.js
// Scores generated ministry content (1–10 per dimension)
// ─────────────────────────────────────────────

const { generate } = require('./openrouter');
const db = require('../db/database');

const EVAL_SYSTEM = `You are a ministry content quality evaluator for Lightline.
Score the assistant output on these dimensions (integers 1–10 only):
- scripture: How well grounded in specific Bible references
- relevance: How well it matches the user's request
- usability: How ready it is for a pastor to use in ministry
- clarity: Structure, readability, pastoral tone

Respond with ONLY valid JSON, no markdown:
{"scripture":N,"relevance":N,"usability":N,"clarity":N,"overall":N,"summary":"one sentence"}`;

async function evaluateContent({ feature, userPrompt, content, generationId, userId }) {
  try {
    const result = await generate({
      feature: 'evaluation',
      system: EVAL_SYSTEM,
      user: `Feature: ${feature}\n\nUser request:\n${userPrompt.slice(0, 2000)}\n\nGenerated content:\n${content.slice(0, 4000)}\n\nReturn JSON scores.`,
      maxTokens: 400,
    });

    const jsonMatch = result.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Evaluator returned non-JSON response.');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const scores = {
      scripture: clampScore(parsed.scripture),
      relevance: clampScore(parsed.relevance),
      usability: clampScore(parsed.usability),
      clarity: clampScore(parsed.clarity),
      overall: clampScore(parsed.overall || averageScores(parsed)),
    };

    if (generationId && userId) {
      db.saveEvaluation({
        generationId,
        userId,
        scores,
        summary: parsed.summary || 'Content evaluated.',
        model: result.model,
      });
    }

    return { scores, summary: parsed.summary, model: result.model };
  } catch (err) {
    console.warn('[Evaluation]', err.message);
    const fallback = {
      scripture: 7,
      relevance: 7,
      usability: 7,
      clarity: 7,
      overall: 7,
    };
    if (generationId && userId) {
      db.saveEvaluation({
        generationId,
        userId,
        scores: fallback,
        summary: 'Automatic evaluation unavailable.',
        model: 'fallback',
      });
    }
    return { scores: fallback, summary: 'Evaluation skipped.', model: null };
  }
}

function clampScore(n) {
  const v = Math.round(Number(n));
  if (Number.isNaN(v)) return 7;
  return Math.min(10, Math.max(1, v));
}

function averageScores(p) {
  const vals = [p.scripture, p.relevance, p.usability, p.clarity].map(clampScore);
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

module.exports = { evaluateContent };
