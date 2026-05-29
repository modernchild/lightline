# Lightline — AI Ministry Companion

> Every minister. Every message. Every time.

---

## What is Lightline?

Lightline is a full-stack AI-powered ministry companion that helps every pastor, preacher, and minister prepare sermons, devotionals, prayers, and ministry content — with spiritual depth and structural excellence.

It works the way a seasoned ministry mentor would: conversationally, intelligently, and responsively — but trained and calibrated specifically for ministry.

---

## Features

| Feature | Description |
|---------|-------------|
| Sermon Builder | Quick Delivery (1-step) and Deep Preparation (5-step) modes |
| WhatsApp Broadcast Writer | Mobile-optimised messages for zone pastors and cell leaders |
| Devotional Writer | Daily and weekly devotionals grounded in Scripture |
| Social Media Content | Posts for Instagram, Twitter/X, and Facebook |
| Bible Study Guide | Inductive study guides for groups and personal study |
| Prayer & Declaration Generator | Intercessory, corporate, personal, and declaration prayers |
| Evangelism Companion | Gospel presentations and outreach scripts |

---

## Project Structure

```
lightline/
├── backend/                         # Node.js + Express API
│   ├── config/
│   │   ├── models.js                # OpenRouter model routing per feature
│   │   └── userStore.js             # In-memory user store (replace with DB at scale)
│   ├── middleware/
│   │   └── auth.js                  # JWT verification middleware
│   ├── routes/
│   │   ├── auth.js                  # POST /register, POST /login, GET /me
│   │   └── generate.js              # All 8 AI generation endpoints
│   ├── scripts/
│   │   └── seedPinecone.js          # Run once to populate the knowledge base
│   ├── services/
│   │   ├── openrouter.js            # OpenRouter API — chat, stream, embeddings
│   │   ├── pinecone.js              # Vector DB — init, query, upsert
│   │   └── prompts.js               # System prompts for every feature ← tune this
│   ├── .env.example                 # Copy to .env and fill in keys
│   ├── package.json
│   ├── railway.toml                 # Railway deployment config
│   └── server.js                    # Express entry point
│
├── frontend/                        # React + Vite SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   └── AuthPage.jsx     # Login + Register screen
│   │   │   ├── dashboard/
│   │   │   │   └── Dashboard.jsx    # Home — all feature cards
│   │   │   ├── features/
│   │   │   │   ├── SermonBuilder.jsx
│   │   │   │   ├── Devotional.jsx
│   │   │   │   ├── WhatsAppBroadcast.jsx
│   │   │   │   ├── BibleStudy.jsx
│   │   │   │   ├── SocialMedia.jsx
│   │   │   │   ├── PrayerGenerator.jsx
│   │   │   │   └── EvangelismCompanion.jsx
│   │   │   └── shared/
│   │   │       ├── FeatureForm.jsx  # Generic form shell for all features
│   │   │       ├── FormField.jsx    # Input, Textarea, Select components
│   │   │       ├── OutputViewer.jsx # Markdown renderer + copy button
│   │   │       └── PageLayout.jsx   # Nav + page wrapper
│   │   ├── hooks/
│   │   │   └── useAuth.jsx          # Global auth context
│   │   ├── services/
│   │   │   └── api.js               # All HTTP calls in one place
│   │   ├── styles/
│   │   │   └── global.css           # Design tokens + global styles
│   │   ├── App.jsx                  # Routing + private route guard
│   │   └── main.jsx                 # React entry point
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── vercel.json                  # Vercel SPA routing config
│   └── vite.config.js               # Vite + dev proxy config
│
├── data/
│   └── training/
│       ├── lightline-training-data.jsonl   # Fine-tuning examples (add more)
│       └── LLM-TRAINING-GUIDE.md           # Complete AI training guide
│
├── .gitignore
├── package.json                     # Root monorepo scripts
├── SETUP.md                         # Step-by-step deployment guide
└── README.md                        # This file
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 + Vite | Fast SPA with component-based UI |
| Styling | CSS custom properties | Design tokens, dark/light mode |
| Backend | Node.js + Express | REST API, JWT auth, rate limiting |
| AI Engine | OpenRouter | Multi-model chat, streaming, embeddings |
| Vector DB | Pinecone | RAG — ministry knowledge retrieval |
| Deployment | Vercel + Railway | Frontend + Backend hosting |
| Auth | Custom JWT | Stateless, no third-party dependency |

---

## Quick Start (local development)

### Prerequisites

- Node.js 18 or higher — https://nodejs.org
- Git — https://git-scm.com

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/lightline.git
cd lightline
```

### 2. Install all dependencies

```bash
npm run install:all
```

This installs both backend and frontend dependencies in one command.

### 3. Set up environment variables

**Backend:**
```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and fill in:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=<generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxx
PINECONE_API_KEY=xxxxxxxx
PINECONE_INDEX_NAME=lightline-ministry
FRONTEND_URL=http://localhost:5173
```

**Frontend:**
```bash
cp frontend/.env.example frontend/.env
```

The frontend `.env` can stay empty for local dev — Vite proxies `/api` calls to the backend automatically.

### 4. Run both servers

```bash
npm run dev
```

This starts the backend on `http://localhost:5000` and the frontend on `http://localhost:5173` concurrently.

Open `http://localhost:5173` — you should see the Lightline login screen.

---

## API Reference

All generation endpoints require a valid JWT in the `Authorization: Bearer <token>` header.

### Auth

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | `{ name, email, password }` | Create account |
| POST | `/api/auth/login` | `{ email, password }` | Sign in, receive token |
| GET | `/api/auth/me` | — | Get current user |

### Generate (all require auth)

| Method | Endpoint | Required body fields | Description |
|--------|----------|---------------------|-------------|
| POST | `/api/generate/sermon/quick` | `topic` | Quick Delivery sermon |
| POST | `/api/generate/sermon/deep` | `topic`, `step` | One step of Deep Prep |
| POST | `/api/generate/devotional` | `topic` | Devotional |
| POST | `/api/generate/whatsapp` | `topic` | WhatsApp broadcast |
| POST | `/api/generate/bible-study` | `passage` | Bible study guide |
| POST | `/api/generate/social` | `topic` | Social media posts |
| POST | `/api/generate/prayer` | `topic` | Prayer or declaration |
| POST | `/api/generate/evangelism` | — | Evangelism script |

**Sermon deep prep steps:** `exegesis` → `outline` → `illustrations` → `application` → `fullDraft`

---

## Deployment

Full step-by-step deployment instructions are in `SETUP.md`. Summary:

### Backend → Railway

1. Push code to GitHub
2. Create new Railway project → deploy from GitHub → select `backend` folder
3. Add all environment variables from `backend/.env.example`
4. Copy your Railway URL (e.g. `https://lightline-backend.up.railway.app`)

### Frontend → Vercel

1. Create new Vercel project → import GitHub repo → set root directory to `frontend`
2. Add environment variable: `VITE_API_URL=https://your-railway-url.up.railway.app`
3. Deploy
4. Copy your Vercel URL → update `FRONTEND_URL` in Railway

---

## Improving AI Quality

There are three levels of AI customisation, from easiest to most advanced:

### Level 1 — Prompt Engineering (free, do this first)

Edit `backend/services/prompts.js`. This file contains the system prompts for every feature. Improving these prompts is the highest-return investment available.

Key things to customise:
- Your theological tradition (Pentecostal, Baptist, Anglican, etc.)
- Your geographic and cultural context (Nigerian church, West African, etc.)
- Your preferred output format and length
- Specific doctrinal emphases

### Level 2 — RAG: Knowledge Base (low cost)

Load your own ministry content into Pinecone so the AI retrieves it before generating responses.

```bash
# After setting up a real embedding model in backend/services/pinecone.js:
npm run seed:pinecone
```

See `data/training/LLM-TRAINING-GUIDE.md` for full instructions on:
- Setting up OpenAI or Cohere embeddings
- Preparing and chunking documents
- Testing retrieval quality

### Level 3 — Fine-tuning (advanced)

Train a language model on your own ministry examples so it learns your exact style, tradition, and tone.

Training data lives in `data/training/lightline-training-data.jsonl`. Add more examples (aim for 100+ before fine-tuning).

See `data/training/LLM-TRAINING-GUIDE.md` for complete instructions covering:
- OpenAI GPT-4o Mini fine-tuning
- Provider-specific fine-tuning via OpenRouter model slugs
- Open-source Llama 3 fine-tuning with Unsloth
- Data collection process and quality checklist

---

## Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Yes | Server port (default 5000) |
| `NODE_ENV` | Yes | `development` or `production` |
| `JWT_SECRET` | Yes | Min 32-char random string |
| `JWT_EXPIRES_IN` | No | Token lifetime (default `7d`) |
| `OPENROUTER_API_KEY` | Yes | OpenRouter API key (chat + embeddings) |
| `PINECONE_API_KEY` | Yes* | Pinecone key (*app works without RAG) |
| `PINECONE_INDEX_NAME` | Yes* | Pinecone index name |
| `FRONTEND_URL` | Yes | Exact Vercel URL for CORS |
| `OPENROUTER_EMBEDDING_MODEL` | No | Embedding model (default `openai/text-embedding-3-small`) |
| `OPENROUTER_GLOBAL_FALLBACK` | No | Global model fallback when primary/fallback fail |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Production only | Railway backend URL |

---

## Scripts

Run from the root directory:

| Script | Command | Description |
|--------|---------|-------------|
| Install all | `npm run install:all` | Install backend + frontend dependencies |
| Dev both | `npm run dev` | Start backend + frontend concurrently |
| Dev backend | `npm run dev:backend` | Start backend only |
| Dev frontend | `npm run dev:frontend` | Start frontend only |
| Build frontend | `npm run build:frontend` | Production build |
| Seed Pinecone | `npm run seed:pinecone` | Upload training data to Pinecone |

---

## Security notes

- Never commit `backend/.env` to Git — it is in `.gitignore`
- Generate a strong, unique `JWT_SECRET` — minimum 64 characters
- The rate limiter is set to 20 AI generation requests per 15 minutes per IP — adjust in `backend/server.js`
- CORS is locked to `FRONTEND_URL` — ensure this is set correctly in production
- The in-memory `userStore.js` resets on server restart — replace with a real database (PostgreSQL or MongoDB) before launching publicly

---

## Roadmap

- [ ] PostgreSQL database (replace in-memory user store)
- [ ] Email verification on registration
- [ ] Usage dashboard (track generations per user)
- [ ] Ministry content library (save and retrieve past outputs)
- [ ] Team accounts (multiple ministers per church)
- [ ] Mobile app (React Native)
- [ ] Fine-tuned model on ministry data
- [ ] WhatsApp Business API direct integration

---

## Programme

AI Foundry · Qubators Global · Cohort 01

---

> "Your word is a lamp to my feet and a light to my path." — Psalm 119:105
