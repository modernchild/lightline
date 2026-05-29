// ─────────────────────────────────────────────
// services/pinecone.js
// Pinecone vector database service.
// Handles: index init, embedding, upsert, query.
//
// NOTE ON EMBEDDINGS:
// Pinecone needs vectors. Embeddings are generated
// via OpenRouter (see services/openrouter.js).
// Set OPENROUTER_API_KEY and OPENROUTER_EMBEDDING_MODEL in .env.
// ─────────────────────────────────────────────

const { Pinecone } = require('@pinecone-database/pinecone');
const { generateEmbedding: openRouterEmbed } = require('./openrouter');

let pineconeClient = null;
let indexInstance = null;

// ── Dimension must match your embedding model ──
// If using OpenAI text-embedding-3-small: 1536
// If using a simple hash (dev only):      256
const VECTOR_DIMENSION = 1536;

/**
 * Initialise the Pinecone client and index.
 * Called once on server start.
 */
async function initPinecone() {
  if (!process.env.PINECONE_API_KEY) {
    console.warn('⚠️  PINECONE_API_KEY not set — RAG disabled.');
    return false;
  }

  try {
    pineconeClient = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

    // Check if index exists, create it if not
    const existingIndexes = await pineconeClient.listIndexes();
    const indexNames = existingIndexes.indexes?.map(i => i.name) || [];

    if (!indexNames.includes(process.env.PINECONE_INDEX_NAME)) {
      console.log(`📦 Creating Pinecone index: ${process.env.PINECONE_INDEX_NAME}`);
      await pineconeClient.createIndex({
        name: process.env.PINECONE_INDEX_NAME,
        dimension: VECTOR_DIMENSION,
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1',
          },
        },
      });
      // Wait for index to be ready
      await new Promise(resolve => setTimeout(resolve, 10000));
    }

    indexInstance = pineconeClient.index(process.env.PINECONE_INDEX_NAME);
    console.log(`✅ Pinecone connected — index: ${process.env.PINECONE_INDEX_NAME}`);
    return true;
  } catch (err) {
    console.error('❌ Pinecone init failed:', err.message);
    return false;
  }
}

/**
 * Generate embedding vector via OpenRouter.
 * Falls back to a zero-vector if the API key is missing or the call fails.
 */
async function generateEmbedding(text) {
  if (!process.env.OPENROUTER_API_KEY) {
    console.warn('⚠️  OPENROUTER_API_KEY not set — RAG embeddings unavailable.');
    return new Array(VECTOR_DIMENSION).fill(0);
  }
  try {
    return await openRouterEmbed(text);
  } catch (err) {
    console.warn('[Embedding]', err.message);
    return new Array(VECTOR_DIMENSION).fill(0);
  }
}

/**
 * Query Pinecone for the top-K most relevant ministry documents.
 * Returns an array of { id, score, metadata: { text, source, type } }
 */
async function queryMinistryContext(queryText, topK = 3) {
  if (!indexInstance) return [];

  try {
    const vector = await generateEmbedding(queryText);
    const results = await indexInstance.query({
      vector,
      topK,
      includeMetadata: true,
    });

    return results.matches
      .filter(match => match.score > 0.55)
      .map(match => ({
        id: match.id,
        score: match.score,
        text: match.metadata?.text || '',
        source: match.metadata?.source || 'Ministry Knowledge Base',
        type: match.metadata?.type || 'general',
      }));
  } catch (err) {
    console.error('[Pinecone Query Error]', err.message);
    return []; // Fail gracefully — app works without RAG
  }
}

/**
 * Upsert documents into Pinecone.
 * Each doc: { id, text, source, type }
 * type: 'scripture' | 'commentary' | 'sermon' | 'theology' | 'general'
 *
 * Usage example (run once to seed your knowledge base):
 *   await upsertMinistryDocuments([
 *     { id: 'rom8-1', text: 'There is therefore now no condemnation...', source: 'Romans 8:1', type: 'scripture' },
 *     { id: 'commentary-grace-1', text: 'Grace is the unmerited favor of God...', source: 'Theology Notes', type: 'commentary' },
 *   ]);
 */
async function upsertMinistryDocuments(documents) {
  if (!indexInstance) {
    throw new Error('Pinecone not initialised.');
  }

  const vectors = await Promise.all(
    documents.map(async (doc) => ({
      id: doc.id,
      values: await generateEmbedding(doc.text),
      metadata: {
        text: doc.text,
        source: doc.source || 'Unknown',
        type: doc.type || 'general',
      },
    }))
  );

  // Pinecone recommends batches of 100
  const batchSize = 100;
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    await indexInstance.upsert(batch);
  }

  console.log(`✅ Upserted ${documents.length} documents to Pinecone.`);
}

module.exports = { initPinecone, queryMinistryContext, upsertMinistryDocuments };
