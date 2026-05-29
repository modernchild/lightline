# Lightline — Complete Setup & Deployment Guide

---

## STEP 1 — Prerequisites (install once)

Install these on your machine before anything else:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | 18+ | https://nodejs.org |
| Git | Latest | https://git-scm.com |
| VS Code | Latest | https://code.visualstudio.com |

Verify installations:
```bash
node --version   # Should print v18.x.x or higher
npm --version    # Should print 9.x.x or higher
git --version    # Should print git version 2.x.x
```

---

## STEP 2 — Get your API keys

You need three accounts. All have free tiers.

### A. OpenRouter (AI chat + embeddings)
1. Go to https://openrouter.ai
2. Create account → go to "Keys"
3. Create an API key → copy it
4. Save it as: `OPENROUTER_API_KEY=sk-or-v1-xxxxxxxx`

### B. Pinecone (Vector Database)
1. Go to https://app.pinecone.io
2. Create account → "Create Index"
3. Index settings:
   - Name: `lightline-ministry`
   - Dimensions: `1536`
   - Metric: `cosine`
   - Cloud: AWS, Region: us-east-1
4. Go to "API Keys" → copy your key
5. Save it as: `PINECONE_API_KEY=xxxxxxxx`

### C. Accounts for deployment
- Railway: https://railway.app (sign up with GitHub)
- Vercel: https://vercel.com (sign up with GitHub)

---

## STEP 3 — Project setup (local)

### 3a. Create your GitHub repository
1. Go to https://github.com → "New repository"
2. Name it `lightline`
3. Set to Private
4. Do NOT initialise with README (we already have files)

### 3b. Push the project code
Open terminal in your lightline project folder:

```bash
cd lightline
git init
git add .
git commit -m "Initial commit — Lightline AI Ministry Companion"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/lightline.git
git push -u origin main
```

---

## STEP 4 — Run locally first

### Backend
```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and fill in your real values:
```
PORT=5000
NODE_ENV=development
JWT_SECRET=generate_a_random_64_char_string_here
OPENROUTER_API_KEY=sk-or-v1-your-key-here
PINECONE_API_KEY=your-pinecone-key
PINECONE_INDEX_NAME=lightline-ministry
FRONTEND_URL=http://localhost:5173
```

Generate a JWT secret (run this in terminal):
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Copy the output into JWT_SECRET.

Start the backend:
```bash
npm run dev
```

Test it:
```bash
curl http://localhost:5000/api/health
# Should return: {"status":"ok","service":"Lightline Backend",...}
```

### Frontend
Open a NEW terminal tab:
```bash
cd frontend
npm install
cp .env.example .env
```

The frontend `.env` for local dev:
```
VITE_API_URL=http://localhost:5000
```

Wait — actually leave VITE_API_URL blank for local dev.
The vite.config.js already proxies /api calls to localhost:5000.
Only set VITE_API_URL in production (to your Railway URL).

Start the frontend:
```bash
npm run dev
```

Open http://localhost:5173 — you should see the Lightline login screen.

---

## STEP 5 — Deploy Backend to Railway

1. Go to https://railway.app → "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your `lightline` repository
4. Railway asks which folder — select `backend`
5. Click "Add Variables" and add ALL your .env values:
   ```
   PORT=5000
   NODE_ENV=production
   JWT_SECRET=your_64_char_secret
   OPENROUTER_API_KEY=sk-or-v1-your-key
   PINECONE_API_KEY=your-pinecone-key
   PINECONE_INDEX_NAME=lightline-ministry
   FRONTEND_URL=https://your-app.vercel.app
   ```
   (You'll update FRONTEND_URL after Vercel deploy)

6. Railway deploys automatically. When complete, click "Settings" → copy your Railway URL.
   It looks like: `https://lightline-backend-production-xxxx.up.railway.app`

7. Test your deployed backend:
   ```
   https://your-railway-url.up.railway.app/api/health
   ```

---

## STEP 6 — Deploy Frontend to Vercel

1. Go to https://vercel.com → "Add New Project"
2. Import your `lightline` GitHub repo
3. Vercel asks for settings:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add Environment Variables:
   ```
   VITE_API_URL=https://your-railway-url.up.railway.app
   ```
5. Click Deploy

6. When done, copy your Vercel URL: `https://lightline.vercel.app`

7. Go back to Railway → update `FRONTEND_URL` to your Vercel URL
8. Railway will redeploy automatically

---

## STEP 7 — Final verification checklist

Test each of these before you share the link:

- [ ] Visit your Vercel URL — login screen loads
- [ ] Register a new account — redirects to dashboard
- [ ] Login with the same account — works
- [ ] Open Sermon Builder → Quick Delivery → generate a sermon
- [ ] Open WhatsApp Broadcast → generate a message
- [ ] Open Devotional → generate a devotional
- [ ] All other features generate without errors
- [ ] Copy button works on output
- [ ] Sign out → redirected to login
- [ ] Try logging in with wrong password → shows error

---

## STEP 8 — Adding content to Pinecone (RAG)

Once live, you can seed your Pinecone index with ministry content.
Create a file `backend/scripts/seedPinecone.js`:

```javascript
require('dotenv').config({ path: '../.env' });
const { initPinecone, upsertMinistryDocuments } = require('../services/pinecone');

async function seed() {
  await initPinecone();
  
  await upsertMinistryDocuments([
    {
      id: 'grace-definition-1',
      text: 'Grace is the unmerited favour of God towards mankind. It is not earned, deserved, or achieved. Grace is the foundation of salvation (Ephesians 2:8-9) and the basis of every blessing God bestows.',
      source: 'Theology: Grace',
      type: 'theology',
    },
    {
      id: 'faith-definition-1',
      text: 'Faith is the substance of things hoped for, the evidence of things not seen (Hebrews 11:1). Biblical faith is not mere intellectual assent but active trust and reliance on God and His Word.',
      source: 'Theology: Faith',
      type: 'theology',
    },
    // Add more documents here...
  ]);
  
  console.log('Seeding complete!');
}

seed().catch(console.error);
```

Run it once:
```bash
cd backend
node scripts/seedPinecone.js
```

Embeddings use OpenRouter (`OPENROUTER_EMBEDDING_MODEL`, default
`openai/text-embedding-3-small`). RAG returns meaningful matches after you
seed the index with `npm run seed:pinecone`. The app works fully without RAG —
the AI uses its base model knowledge.

---

## Common issues and fixes

**"CORS error" in browser console**
→ Check that FRONTEND_URL in Railway matches your exact Vercel URL (no trailing slash)

**"Invalid token" after deploy**
→ Make sure JWT_SECRET is the same in both local and Railway. Never change it after users exist.

**Pinecone connection fails on startup**
→ Check PINECONE_API_KEY and PINECONE_INDEX_NAME are correct. App still works without it.

**Vercel build fails**
→ Check that Root Directory is set to `frontend` in Vercel project settings

**Railway "application failed to respond"**
→ Go to Railway logs. Usually a missing environment variable. Check all 6 are set.
