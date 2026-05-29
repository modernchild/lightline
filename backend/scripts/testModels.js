require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { testModel } = require('../services/openrouter');
const { FEATURE_MODELS } = require('../config/models');

async function main() {
  if (!process.env.OPENROUTER_API_KEY) {
    console.error('Set OPENROUTER_API_KEY in backend/.env');
    process.exit(1);
  }

  const models = [...new Set(Object.values(FEATURE_MODELS).flatMap(c => [c.primary, c.fallback]))];
  console.log(`Testing ${models.length} models...\n`);

  let passed = 0;
  for (const model of models) {
    const r = await testModel(model);
    const status = r.ok ? 'OK' : 'FAIL';
    if (r.ok) passed++;
    console.log(`${status} ${model} (${r.elapsedMs}ms) ${r.ok ? r.reply : r.error?.slice(0, 80)}`);
  }

  console.log(`\n${passed}/${models.length} passed`);
  process.exit(passed === models.length ? 0 : 1);
}

main().catch(err => { console.error(err); process.exit(1); });
