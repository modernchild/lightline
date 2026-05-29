# 🚀 Production Deployment Guide

**Status:** Complete setup for Railway + Vercel deployment

---

## 📋 Prerequisites

You'll need accounts on:

- ✅ **GitHub** — Code repository
- ✅ **Supabase** — PostgreSQL database (free tier)
- ✅ **Cloudinary** — Media storage (free tier, 25GB)
- ✅ **OpenRouter** — AI models (pay-as-you-go)
- ✅ **Railway** — Backend hosting (free tier)
- ✅ **Vercel** — Frontend hosting (free tier)
- ✅ **Google Cloud** — OAuth (for Google sign-in)
- ✅ **Pinecone** — Vector DB for RAG (optional)

---

## 🔧 STEP 1 — Local Setup

### 1.1 Install Dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 1.2 Create .env File

```bash
cd backend
cp ../.env.example .env
```

Edit `.env` with your credentials (see below for where to get them).

### 1.3 Test Locally

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

Visit `http://localhost:5173` and test authentication.

---

## 🗄️ STEP 2 — Set Up Supabase

### 2.1 Create Project

1. Go to https://supabase.com
2. Click **"New Project"** → Sign in with GitHub
3. **Name:** `lightline`
4. **Password:** Generate strong password → **Save it**
5. **Region:** Pick closest to your users
6. Click **"Create new project"** → Wait 2-3 minutes

### 2.2 Run Migration

1. In Supabase dashboard, click **"SQL Editor"** (left sidebar)
2. Click **"New Query"**
3. Copy entire contents of `backend/migrations/001-init.sql`
4. Paste into the editor
5. Click **"Run"** button (top right)

**Success:** You'll see "Finished successfully" message and 5 new tables.

### 2.3 Get Connection String

1. Click **Settings** (bottom left) → **Database**
2. Look for "Connection pooling" section
3. Copy the full **Connection string (URI)**
   - Looks like: `postgresql://postgres:[password]@[host]:[port]/postgres?sslmode=require`
4. In your `.env`, set: `DATABASE_URL=postgresql://...`

### 2.4 Get API Keys

1. Click **Settings** → **API**
2. Copy **Project URL** → `SUPABASE_URL=`
3. Copy **anon public key** → `SUPABASE_ANON_KEY=`
4. Copy **service_role key** → `SUPABASE_SERVICE_ROLE_KEY=`

Add to `.env`.

---

## 🎨 STEP 3 — Set Up Cloudinary

### 3.1 Create Account

1. Go to https://cloudinary.com
2. Click **"Sign Up"** → Use email or GitHub
3. Verify email
4. Go to **Dashboard**

### 3.2 Get Credentials

In Dashboard, find:
- **Cloud Name** → `CLOUDINARY_CLOUD_NAME=`
- **API Key** → `CLOUDINARY_API_KEY=`
- **API Secret** → `CLOUDINARY_API_SECRET=`

Add to `.env`.

### 3.3 Create Upload Preset (Optional)

1. Click **Settings** (gear icon)
2. Go to **Upload** tab
3. Scroll to "Upload presets"
4. Click **"Add upload preset"**
5. **Name:** `lightline_avatars`
6. **Signing Mode:** Unsigned
7. Click **Save**
8. Add to `.env`: `CLOUDINARY_UPLOAD_PRESET=lightline_avatars`

---

## 🤖 STEP 4 — Set Up OpenRouter

### 4.1 Create Account

1. Go to https://openrouter.ai
2. Sign up with email or GitHub
3. Go to **Dashboard**

### 4.2 Get API Key

1. Click **"Keys"** in left sidebar
2. Click **"Create Key"**
3. Copy the key → `OPENROUTER_API_KEY=sk-or-v1-...`
4. Add to `.env`

### 4.3 Add Credit

1. Click **"Billing"** → **"Add Credit"**
2. Add $10 or more (pay-as-you-go)
3. Note: AI generation uses credits, not tokens

---

## 🔐 STEP 5 — Set Up Google OAuth

### 5.1 Create Google Cloud Project

1. Go to https://console.cloud.google.com
2. Click project dropdown → **"New Project"**
3. **Name:** `lightline`
4. Click **"Create"** → Wait a minute

### 5.2 Create OAuth Credentials

1. In left menu, click **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Click **"Configure Consent Screen"**
4. Select **"External"** → Click **"Create"**
5. Fill in:
   - **App name:** Lightline
   - **User support email:** your-email@example.com
   - **Developer contact:** your-email@example.com
6. Click **"Save & Continue"** (skip optional fields)
7. Click **"Save & Continue"** again
8. Click **"Back to Dashboard"**

### 5.3 Get Client ID

1. Click **"Credentials"** → **"Create Credentials"** → **"OAuth client ID"**
2. **Application type:** Web application
3. **Name:** Lightline Web
4. **Authorized JavaScript origins:** 
   - `http://localhost:5173`
   - `http://localhost:3000`
   - `https://your-vercel-domain.vercel.app` (after deployment)
5. **Authorized redirect URIs:**
   - `http://localhost:5173/`
   - `https://your-vercel-domain.vercel.app/`
6. Click **"Create"**
7. Copy **Client ID** → `GOOGLE_CLIENT_ID=...`
8. Add to `.env`

---

## 📦 STEP 6 — Update package.json (if needed)

Make sure `backend/package.json` has these packages:

```json
{
  "dependencies": {
    "@pinecone-database/pinecone": "^2.2.2",
    "@supabase/supabase-js": "^2.38.0",
    "bcryptjs": "^2.4.3",
    "cloudinary": "^1.40.0",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "express-rate-limit": "^7.3.1",
    "google-auth-library": "^10.6.2",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5",
    "pg": "^8.11.0",
    "streamifier": "^0.1.1",
    "uuid": "^9.0.1"
  }
}
```

If missing, run:
```bash
npm install @supabase/supabase-js cloudinary multer pg streamifier
```

---

## 🚀 STEP 7 — Deploy Backend to Railway

### 7.1 Push to GitHub

```bash
git add .
git commit -m "Production-ready setup with Supabase + Cloudinary"
git push origin main
```

### 7.2 Create Railway Project

1. Go to https://railway.app
2. Click **"New Project"** → **"Deploy from GitHub Repo"**
3. Select your GitHub account → Select `lightline` repo
4. Railway will auto-detect Node.js
5. Click **"Deploy"** → Wait for build (5-10 min)

### 7.3 Add Environment Variables

1. In Railway dashboard, click your project
2. Click **"Variables"** tab
3. Add each variable from your `.env`:

```
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=xxx...
OPENROUTER_API_KEY=sk-or-v1-...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
PINECONE_API_KEY=pcsk_...
PINECONE_INDEX_NAME=lightline-ministry
```

### 7.4 Get Backend URL

1. In Railway, click your backend service
2. Look for "Domain" section
3. Copy the URL (looks like: `https://lightline-backend.railway.app`)
4. **Save this — you'll need it for the frontend**

---

## 🎨 STEP 8 — Deploy Frontend to Vercel

### 8.1 Connect GitHub

1. Go to https://vercel.com
2. Click **"New Project"** → **"Import Git Repository"**
3. Select your GitHub account
4. Select `lightline` repo
5. Click **"Import"**

### 8.2 Configure Build Settings

1. **Framework Preset:** Vite
2. **Build Command:** `cd frontend && npm run build`
3. **Output Directory:** `frontend/dist`
4. **Install Command:** `npm install`

### 8.3 Add Environment Variables

1. Before deploying, click **"Environment Variables"**
2. Add:

```
VITE_API_URL=https://your-railway-backend-url
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

3. Click **"Deploy"** → Wait for build (3-5 min)

### 8.4 Get Frontend URL

1. After deployment, you'll see your frontend URL
2. Looks like: `https://lightline.vercel.app`

### 8.5 Update Google OAuth

1. Go back to Google Cloud Console
2. Go to **Credentials** → **OAuth 2.0 Client IDs** → Your web client
3. Add to **Authorized JavaScript origins:**
   - `https://your-vercel-domain.vercel.app`
4. Add to **Authorized redirect URIs:**
   - `https://your-vercel-domain.vercel.app/`
5. Click **"Save"**

### 8.6 Update Backend (if needed)

If frontend URL changed, update in Railway:
1. Go to Railway → backend → Variables
2. Update `FRONTEND_URL=https://your-vercel-domain.vercel.app`

---

## ✅ Testing Production

### Test 1: Frontend Loads
```
Visit https://your-vercel-domain.vercel.app
Should see Lightline login page ✓
```

### Test 2: Sign Up
```
Click "Create Account"
Register with test email
Should create account in Supabase ✓
```

### Test 3: Generate Content
```
Log in
Click a feature (e.g., "Sermon Builder")
Generate content
Should stream via OpenRouter ✓
```

### Test 4: Upload Avatar
```
Click profile icon
Upload image
Should upload to Cloudinary ✓
```

### Test 5: History
```
Click "History"
Should show all generations from Supabase ✓
```

---

## 📊 Production Monitoring

### Check Logs

**Backend (Railway):**
1. Go to Railway → Your project
2. Click **"Deployments"** tab
3. View logs in real-time

**Frontend (Vercel):**
1. Go to Vercel → Your project
2. Click **"Analytics"** for performance
3. Click **"Logs"** for errors

### Monitor Database

**Supabase:**
1. Go to Supabase → Your project
2. **"Logs"** → View all queries
3. **"Storage"** → Check usage

---

## 🆘 Troubleshooting

### Backend won't start
```
Check:
1. DATABASE_URL is correct (no typos)
2. All SUPABASE_* variables are set
3. Check Railway logs for error message
```

### Avatar upload fails
```
Check:
1. CLOUDINARY_CLOUD_NAME is set
2. CLOUDINARY_API_KEY is valid
3. File size < 5MB
4. Image format is JPEG/PNG/GIF/WebP
```

### Google sign-in fails
```
Check:
1. GOOGLE_CLIENT_ID is correct
2. Frontend URL in Google Console matches Vercel domain
3. OAuth consent screen is configured
```

### No history showing
```
Check:
1. User ID matches in Supabase (SELECT * FROM generations WHERE user_id='...')
2. SUPABASE_SERVICE_ROLE_KEY is set correctly
3. Row Level Security policies are in place
```

---

## 🎉 Success Checklist

- [ ] Supabase project created with tables
- [ ] Cloudinary account set up with API keys
- [ ] OpenRouter account funded with credits
- [ ] Google OAuth credentials created
- [ ] Backend deployed to Railway
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set on both platforms
- [ ] Can register new user
- [ ] Can generate content (sermon, devotional, etc.)
- [ ] Can upload avatar
- [ ] Can view history
- [ ] Production URLs are live and working

---

## 🔄 Continuous Deployment

After deployment, just push to GitHub:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Both Railway and Vercel will **automatically redeploy**! 🚀

---

## 💰 Cost Estimate (Monthly)

| Service | Free Tier | Cost |
|---------|-----------|------|
| Supabase | 500MB storage | $5-25 |
| Cloudinary | 25GB storage | FREE |
| OpenRouter | None | Pay per 1M tokens |
| Railway | $5 credit | $5-20 |
| Vercel | Included | FREE |
| Google Cloud | Included | FREE |
| **Total** | | **$10-50/mo** |

---

## 📚 Useful Links

- Supabase Docs: https://supabase.com/docs
- Cloudinary Docs: https://cloudinary.com/documentation
- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- OpenRouter: https://openrouter.ai/docs

---

**Congratulations!** Your app is now production-ready! 🎉
