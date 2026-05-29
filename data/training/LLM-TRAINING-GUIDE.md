# Lightline — LLM Training & Fine-Tuning Guide

> How to build, train, and improve the AI intelligence layer of Lightline.

---

## Understanding what "training your LLM" means for Lightline

There are **three distinct levels** of AI customisation available to you, from easiest to most advanced. You do not need to do all three — start with Level 1, which costs nothing and can dramatically improve quality.

| Level | Name | Cost | Skill needed | Impact |
|-------|------|------|-------------|--------|
| 1 | Prompt Engineering | Free | Low | High |
| 2 | RAG (knowledge injection) | Low | Medium | Very High |
| 3 | Fine-tuning | $$$  | High | Highest |

---

## Level 1 — Prompt Engineering (start here)

**What it is:** Improving the system prompts that Lightline sends to the AI (via OpenRouter) before every request. These live in `backend/services/prompts.js`.

**Why it matters:** A well-engineered prompt can double the quality of output without touching a line of model code. This is the highest return-on-effort investment available to you.

### How to improve your prompts

Open `backend/services/prompts.js`. Every feature has a `system` prompt. You can refine them by:

**1. Adding your theological position**
```javascript
// Before
const BASE_SYSTEM = `You are Lightline — an AI ministry companion...`

// After — add your doctrinal stance
const BASE_SYSTEM = `You are Lightline — an AI ministry companion built for 
ministers in the Word of Faith and Pentecostal tradition. Emphasise:
- The present-day operation of all spiritual gifts
- Divine healing as part of the atonement (Isaiah 53:4-5)
- Faith declarations rooted in Scripture
- The importance of speaking God's word`
```

**2. Specifying your denomination or tradition**
```javascript
// For Anglican/Episcopal
`Honour liturgical structure. Reference the Book of Common Prayer where appropriate.
Use traditional language for Scripture citations.`

// For Baptist  
`Emphasise believer's baptism and the priesthood of all believers.
Avoid sacramental language. The Lord's Supper is memorial, not sacrificial.`

// For Pentecostal/Charismatic
`The gifts of the Spirit are active today. Include prophetic application.
Emphasise personal encounter with the Holy Spirit.`
```

**3. Specifying your geographic and cultural context**
```javascript
// For Nigerian Pentecostal context
`Most ministers using this tool are Nigerian and West African.
- Use illustrations relevant to African family, community, and governance structures
- Reference relevant African historical examples where appropriate
- Avoid exclusively Western cultural illustrations
- Understand that authority structures in ministry are respected and honoured`
```

**4. Controlling output length and format**
```javascript
// In sermonQuick prompt
`Format requirements:
- Introduction: 150-200 words
- Each point: 200-250 words with scripture, explanation, and one illustration
- Application: 150 words with three specific action steps
- Closing: 100 words
Total target: 900-1100 words`
```

### Testing your prompts

After editing `prompts.js`, restart the backend and test immediately:
```bash
cd backend && npm run dev
# Then test via the frontend or via curl:
curl -X POST http://localhost:5000/api/generate/sermon/quick \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"topic":"Faith in difficult seasons","scripture":"Hebrews 11:1"}'
```

---

## Level 2 — RAG: Building your Ministry Knowledge Base

**What it is:** Storing your own ministry content in Pinecone so the model retrieves relevant context before answering. This makes's responses feel tailored to *your* ministry, not generic.

**What to put in your knowledge base:**

| Content type | Examples | How to get it |
|-------------|---------|---------------|
| Your own sermons | Past sermon manuscripts | Export from your notes app |
| Your church's doctrinal statement | Statement of faith | Copy from your website |
| Favourite commentaries | Matthew Henry, Spurgeon excerpts | Public domain — free |
| Denomination guidelines | Official position papers | Download from your denomination |
| Bible dictionary content | Vine's, Strong's definitions | Public domain |
| Your pastor's teaching notes | Personal theology notes | Type them up |

### Step 1 — Embeddings (configured)

RAG embeddings use OpenRouter via `backend/services/openrouter.js`. In `backend/.env` set:

```
OPENROUTER_API_KEY=sk-or-v1-...
# optional:
OPENROUTER_EMBEDDING_MODEL=openai/text-embedding-3-small
```

Pinecone index dimension must stay **1536** for the default embedding model.

### Step 2 — Prepare your documents

Format each document as:
```javascript
{
  id: 'unique-id-no-spaces',      // e.g. 'sermon-faith-2024-01'
  text: 'The actual content...',  // 100-500 words is ideal per chunk
  source: 'Human-readable name',  // e.g. 'Sunday Sermon Jan 2024'
  type: 'sermon',                 // scripture | theology | commentary | sermon | general
}
```

**Chunking tip:** Do not put entire books into one document. Break long texts into 200-500 word chunks. Each chunk gets its own ID and embedding. This improves retrieval quality significantly.

### Step 3 — Add your documents to the seed file

Open `backend/scripts/seedPinecone.js` and add your documents to the `SEED_DOCUMENTS` array. Then run:
```bash
cd backend
node scripts/seedPinecone.js
```

### Step 4 — Test retrieval quality

Add a test route temporarily in `backend/routes/generate.js`:
```javascript
router.get('/test-rag', async (req, res) => {
  const { queryMinistryContext } = require('../services/pinecone');
  const results = await queryMinistryContext(req.query.q || 'faith healing', 3);
  res.json({ results });
});
```

Call it: `GET /api/generate/test-rag?q=faith+in+suffering`

You should see your documents returned with relevance scores above 0.7.

---

## Level 3 — Fine-Tuning a Language Model

**What it is:** Training a language model on your own data so it learns the specific patterns, tone, theology, and style you want. The model's weights are literally modified to reflect your content.

**When you need it:**
- You have 100+ unique ministry documents and the base model's general knowledge is not enough
- You want the model to sound like a specific teacher or tradition
- You are handling very specialised doctrinal content not well covered in base model training
- You want to reduce token costs at scale by using a smaller, fine-tuned model

**When you do NOT need it:**
- You are still in early development — prompting + RAG will cover you for a long time
- You have fewer than 50-100 training examples — fine-tuning on small data often degrades quality
- Your budget is under $500/month — the cost of fine-tuning + inference can be significant

---

### Fine-tuning Option A — OpenAI GPT-4o Mini (most practical for production)

This is the most accessible fine-tuning path. GPT-4o Mini is cheap to run after fine-tuning.

#### Data requirements
- Minimum: 50 examples (in practice, aim for 200+)
- Format: JSONL, each line is one training example
- File: `data/training/lightline-training-data.jsonl` (already created in this repo)

#### Data format (already in your JSONL file)
```json
{
  "messages": [
    {"role": "system", "content": "You are Lightline..."},
    {"role": "user", "content": "Write a sermon on grace..."},
    {"role": "assistant", "content": "# Saved By Grace\n\n...the full ideal response..."}
  ]
}
```

#### How to create more training examples

The quality of training data is everything. For each example:
1. Write the ideal system prompt for that feature
2. Write a realistic user input (topic, scripture, occasion)
3. Write the *ideal* output — the best possible response you want the model to produce
4. The output should reflect your theological tradition, tone, and style

**Target: at least 20 examples per feature (140+ total for all 7 features)**

#### Running the fine-tune (OpenAI)

Install the OpenAI CLI:
```bash
pip install openai
```

Upload your training file:
```bash
openai api files.create \
  -f data/training/lightline-training-data.jsonl \
  -p fine-tune
```

Start the fine-tune job:
```bash
openai api fine_tuning.jobs.create \
  -t "file-xxxxxxxx" \          # file ID from upload
  -m "gpt-4o-mini-2024-07-18"  # base model
```

Monitor progress:
```bash
openai api fine_tuning.jobs.follow -i "ftjob-xxxxxxxx"
```

This takes 30 minutes to 2 hours depending on data size.

#### Using your fine-tuned model in Lightline

Once complete, you receive a model ID like `ft:gpt-4o-mini-2024-07-18:your-org:lightline:xxxxxxxx`.

Update `backend/services/openrouter.js` — or create a parallel service `backend/services/openai.js`:

```javascript
// backend/services/openai.js
const { OpenAI } = require('openai');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateWithFineTune({ system, user, ragContext, maxTokens = 2048 }) {
  const userMessage = ragContext
    ? `[Ministry Context]\n${ragContext}\n\n---\n\n${user}`
    : user;

  const response = await client.chat.completions.create({
    model: process.env.OPENAI_FINE_TUNE_MODEL, // your ft: model ID
    max_tokens: maxTokens,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: userMessage },
    ],
  });

  return response.choices[0].message.content;
}

module.exports = { generateWithFineTune };
```

Add to `backend/.env`:
```
OPENAI_FINE_TUNE_MODEL=ft:gpt-4o-mini-2024-07-18:your-org:lightline:xxxxxxxx
```

Update `backend/routes/generate.js` to use this service through OpenRouter for specific routes.

---

### Fine-tuning Option B — Via OpenRouter

After fine-tuning with a provider (e.g. OpenAI `ft:...`), set the model slug as `primary` in `backend/config/models.js`. Requests keep using `backend/services/openrouter.js`.

---

### Fine-tuning Option C — Open Source (Llama 3, Mistral)

For complete control and zero ongoing inference cost, you can fine-tune an open-source model and self-host it.

**Models to consider:**
- `Meta-Llama-3.1-8B-Instruct` — strong balance of quality and size
- `Mistral-7B-Instruct-v0.3` — excellent for structured output

**Tools:**
- **Unsloth** (https://unsloth.ai) — fastest fine-tuning, free on Google Colab
- **Axolotl** (https://github.com/axolotl-org/axolotl) — more configurable
- **LLaMA-Factory** (https://github.com/hiyouga/LLaMA-Factory) — GUI available

**Basic Unsloth workflow (Google Colab — free GPU):**
```python
from unsloth import FastLanguageModel
import torch

model, tokenizer = FastLanguageModel.from_pretrained(
    model_name = "unsloth/Meta-Llama-3.1-8B-Instruct",
    max_seq_length = 4096,
    load_in_4bit = True,   # reduces memory usage
)

# Apply LoRA adapters (efficient fine-tuning)
model = FastLanguageModel.get_peft_model(
    model,
    r = 16,
    target_modules = ["q_proj", "k_proj", "v_proj", "o_proj",
                      "gate_proj", "up_proj", "down_proj"],
    lora_alpha = 16,
    lora_dropout = 0,
    bias = "none",
    use_gradient_checkpointing = "unsloth",
)

# Load your training data from the JSONL file
from datasets import load_dataset
dataset = load_dataset("json", data_files="lightline-training-data.jsonl", split="train")

# Train
from trl import SFTTrainer
trainer = SFTTrainer(
    model = model,
    tokenizer = tokenizer,
    train_dataset = dataset,
    dataset_text_field = "text",
    max_seq_length = 4096,
)
trainer.train()

# Save and export
model.save_pretrained("lightline-llama3-finetuned")
```

**Self-hosting the model:**
```bash
# Install Ollama (https://ollama.ai)
# Convert your model to GGUF format, then:
ollama create lightline -f Modelfile
ollama serve  # runs on localhost:11434
```

Update `backend/services/openrouter.js` to call your local model:
```javascript
// Replace OpenRouter fetch with:
const response = await fetch('http://localhost:11434/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'lightline',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: userMessage },
    ],
  }),
});
```

---

## Building your training dataset — practical guide

The single most important thing you can do is create high-quality training examples. Here is a repeatable process:

### The collection process

**Week 1-2 — Collect real inputs**
Talk to the 5-10 ministers who will use Lightline. Ask them:
- What topics do you preach most?
- What scriptures do you return to frequently?
- What occasions do you regularly prepare for?
- What does a perfect sermon outline look like to you?

Write down 20-30 real topic + scripture combinations they actually use.

**Week 2-4 — Create ideal outputs**
For each topic + scripture combination, write the output you wish Lightline would produce. Do not use an LLM to write these — write them yourself, or have an experienced minister write them. These become your ground truth.

This is labour-intensive but it is the foundation of a well-trained model.

**Week 4+ — Expand systematically**
- 20 sermon outlines covering different books of the Bible
- 20 devotionals covering different life situations
- 15 WhatsApp broadcasts for different church occasions
- 15 Bible study guides for different passages
- 10 intercessory prayers for different focuses
- 10 evangelism scripts for different contexts
- 10 social media post sets

**Target: 100 examples minimum before fine-tuning. 300 for a strong model.**

### Quality checklist for each training example

Before adding an example to your JSONL file, verify:
- [ ] The output is doctrinally accurate for your tradition
- [ ] All scripture references are correctly cited (book, chapter, verse)
- [ ] The tone is pastoral, not academic or robotic
- [ ] The output is the right length for the feature
- [ ] You would be proud for a minister to receive this as output
- [ ] The formatting uses proper Markdown headings

---

## Recommended roadmap

### Month 1 — Foundation
- [ ] Deploy Lightline (follow SETUP.md)
- [ ] Refine prompts in `prompts.js` for your theological tradition
- [ ] Set up OpenAI embedding and seed Pinecone with 50+ documents
- [ ] Test all 7 features with real ministers

### Month 2 — Knowledge base
- [ ] Collect 200+ ministry documents (sermons, notes, doctrine)
- [ ] Chunk and upload all documents to Pinecone
- [ ] Begin collecting training examples from real usage
- [ ] Target: 50 high-quality JSONL training examples

### Month 3 — Fine-tuning
- [ ] Reach 100+ training examples
- [ ] Run first fine-tune on GPT-4o Mini or use an OpenRouter-supported fine-tune
- [ ] A/B test fine-tuned model vs base models on quality
- [ ] Iterate on training data based on results

### Month 6+ — Scale
- [ ] 300+ training examples, continuous improvement
- [ ] Consider self-hosted open-source model for cost reduction
- [ ] Evaluate additional OpenRouter model slugs for cost/quality

---

## Cost reference

| Approach | Setup cost | Monthly cost (1000 users) |
|----------|-----------|--------------------------|
| OpenRouter (current) | $0 | ~$150-300 |
| Embeddings via OpenRouter | included in usage | ~$2/month |
| GPT-4o Mini fine-tune | ~$50 training | ~$40-80/month |
| Self-hosted Llama3 (GPU server) | ~$200 setup | ~$30-60/month |
| Provider fine-tune via OpenRouter | Varies | Varies |

---

## Questions to ask before fine-tuning

1. **Is prompt engineering + RAG already giving good results?** If yes, stay there. Fine-tuning is not always better — it can reduce the model's general knowledge.

2. **Do I have at least 100 high-quality training examples?** If not, the fine-tune will not meaningfully improve over the base model.

3. **Do I have a budget?** Fine-tuning GPT-4o Mini costs approximately $8-25 per training run depending on dataset size. You will run multiple iterations.

4. **Can I evaluate quality systematically?** You need a way to measure whether the fine-tuned model is actually better. Create a test set of 20 prompts with ideal outputs and score each model response.

---

*This guide lives at `data/training/LLM-TRAINING-GUIDE.md`. Update it as your approach evolves.*
