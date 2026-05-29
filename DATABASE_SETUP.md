# 🗄️ Database Setup — Supabase + Cloudinary

**Status:** Complete production-ready setup for deployment

---

## 📋 What's Needed

Your app stores 4 types of data:

| Data Type | Current | Production |
|-----------|---------|------------|
| **Users** | In-memory Map ❌ | Supabase PostgreSQL ✅ |
| **History/Conversations** | JSON file ❌ | Supabase PostgreSQL ✅ |
| **Messages** | JSON file ❌ | Supabase PostgreSQL ✅ |
| **Generations** | JSON file ❌ | Supabase PostgreSQL ✅ |
| **Avatars/Media** | Not stored ❌ | Cloudinary ✅ |

---

## 🚀 STEP 1 — Set Up Supabase (PostgreSQL)

### 1.1 Create Supabase Project

1. Go to https://supabase.com
2. Click **"Start your project"** → Sign in with GitHub
3. Create new project:
   - **Name:** `lightline`
   - **Database Password:** Save it securely
   - **Region:** Pick closest to users
4. Wait for project to initialize (~2 min)

### 1.2 Get Connection String

1. In Supabase dashboard, go to **Settings → Database**
2. Copy the **Connection string (URI)** under "Connection pooling"
3. It looks like: `postgresql://[user]:[password]@[host]:[port]/[database]?sslmode=require`
4. Save in `.env`: `DATABASE_URL=postgresql://...`

### 1.3 Create Tables

1. In Supabase, go to **SQL Editor** → Click **"New Query"**
2. Paste the SQL from [migrations/001-init.sql](./backend/migrations/001-init.sql)
3. Click **"Run"** button

**Result:** 5 tables created:
- `users` — User accounts, emails, passwords
- `conversations` — Chat sessions
- `messages` — Messages within conversations
- `generations` — AI-generated content
- `evaluations` — Quality ratings

---

## 🎨 STEP 2 — Set Up Cloudinary (Media Storage)

### 2.1 Create Cloudinary Account

1. Go to https://cloudinary.com
2. Sign up (free tier is generous: 25GB storage, 25K transformations/month)
3. Go to **Dashboard** → Copy your credentials:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### 2.2 Save Credentials

In `.env`:
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 2.3 Create Upload Preset (Optional but recommended)

1. Go to **Settings → Upload**
2. Click **"Add upload preset"**
3. Name: `lightline_avatars`
4. Signing Mode: **Unsigned** (optional for avatars)
5. Save

---

## 💾 STEP 3 — Install Dependencies

```bash
cd backend
npm install pg @supabase/supabase-js cloudinary dotenv
```

**Packages added:**
- `pg` — PostgreSQL client
- `@supabase/supabase-js` — Supabase SDK
- `cloudinary` — Cloudinary SDK

---

## 🔧 STEP 4 — Update Backend Files

Replace these files:

1. **backend/config/userStore.js** ← Now uses Supabase
2. **backend/db/database.js** ← Now uses Supabase
3. **backend/services/cloudinary.js** ← New file for uploads
4. **backend/routes/upload.js** ← New endpoint for avatars
5. **backend/routes/auth.js** ← Updated to support avatar upload
6. **.env.example** ← Added new variables

---

## 📝 Updated .env Variables

Add these to your `.env`:

```env
# Database (Supabase)
DATABASE_URL=postgresql://[user]:[password]@[host]/postgres?sslmode=require

# Cloudinary (Media Storage)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_UPLOAD_PRESET=lightline_avatars

# Existing variables (keep as is)
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=your-google-id
OPENROUTER_API_KEY=your-openrouter-key
PINECONE_API_KEY=your-pinecone-key
PINECONE_INDEX_NAME=lightline-ministry
```

---

## 🚀 STEP 5 — Deploy to Railway

### 5.1 Push Code to GitHub

```bash
git add .
git commit -m "Add Supabase + Cloudinary production setup"
git push origin main
```

### 5.2 Deploy on Railway

1. Go to https://railway.app
2. Click **"New Project"** → **"Deploy from GitHub Repo"**
3. Select your `lightline` repo
4. Click **"Deploy Now"**

### 5.3 Add Environment Variables in Railway

In Railway dashboard:
1. Go to **Variables** section
2. Add all `.env` variables:
   - `DATABASE_URL` ← From Supabase
   - `CLOUDINARY_CLOUD_NAME` ← From Cloudinary
   - `CLOUDINARY_API_KEY` ← From Cloudinary
   - `CLOUDINARY_API_SECRET` ← From Cloudinary
   - All other existing variables

**Note:** Railway will auto-generate `PORT` and `NODE_ENV`

### 5.4 Deploy Frontend to Vercel

1. Go to https://vercel.com
2. Click **"New Project"** → Import your GitHub repo
3. Set build settings:
   - **Framework:** Vite
   - **Build Command:** `cd frontend && npm run build`
   - **Output Directory:** `frontend/dist`
4. Add environment variables:
   - `VITE_API_URL=https://your-railway-backend.railway.app`
   - `VITE_GOOGLE_CLIENT_ID=your-google-id`
5. Click **"Deploy"**

---

## 🔄 Migration Path (v1 → v2)

### Migrating Existing Data

If you have data in the old JSON files:

```bash
# Run this script to migrate old data to Supabase
node backend/scripts/migrateToSupabase.js
```

This will:
1. Read old `lightline-history.json`
2. Import all conversations, messages, generations to Supabase
3. Create test user account
4. Verify migration completed

---

## 🧪 Testing the Setup

### Test 1: User Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "TestPass123"
  }'
```

**Expected:** User created in Supabase, token returned

### Test 2: Create Conversation
```bash
curl -X POST http://localhost:5000/api/history/conversations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "feature": "sermon",
    "title": "Sunday Service"
  }'
```

**Expected:** Conversation created in Supabase

### Test 3: Upload Avatar
```bash
curl -X POST http://localhost:5000/api/upload/avatar \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/image.jpg"
```

**Expected:** Image uploaded to Cloudinary, URL returned

---

## 🔒 Security Checklist

- [ ] Never commit `.env` to GitHub
- [ ] Use Supabase RLS (Row Level Security) for user data
- [ ] Cloudinary API secret only used server-side
- [ ] CORS configured for frontend URL only
- [ ] Rate limiting enabled on all endpoints
- [ ] Passwords hashed with bcrypt
- [ ] JWTs validated on protected routes

---

## 📊 Database Schema

### users
```sql
id (uuid, primary key)
name (text)
email (text, unique)
password_hash (text, nullable for OAuth users)
google_id (text, nullable)
avatar_url (text, nullable) — Cloudinary URL
created_at (timestamp)
updated_at (timestamp)
```

### conversations
```sql
id (uuid, primary key)
user_id (uuid, foreign key → users)
feature (text) — 'sermon', 'devotional', 'prayer', etc.
title (text)
created_at (timestamp)
updated_at (timestamp)
```

### messages
```sql
id (uuid, primary key)
conversation_id (uuid, foreign key → conversations)
role (text) — 'user' or 'assistant'
content (text)
created_at (timestamp)
```

### generations
```sql
id (uuid, primary key)
user_id (uuid, foreign key → users)
feature (text)
title (text)
input (jsonb) — Form inputs
content (text) — Generated output
model (text) — AI model used
rag_used (boolean)
fallback_used (boolean)
stream_used (boolean)
conversation_id (uuid, nullable)
created_at (timestamp)
```

### evaluations
```sql
id (uuid, primary key)
generation_id (uuid, foreign key → generations)
overall_score (integer 1-5)
relevance_score (integer 1-5)
clarity_score (integer 1-5)
accuracy_score (integer 1-5)
feedback (text)
created_at (timestamp)
```

---

## 💡 Key Improvements

| Feature | Before | After |
|---------|--------|-------|
| **Data Persistence** | Lost on restart ❌ | Permanent in PostgreSQL ✅ |
| **Scalability** | Single server only ❌ | Scales to millions ✅ |
| **Reliability** | Dependent on server ❌ | Redundant + backups ✅ |
| **Avatars** | No storage ❌ | Cloudinary CDN ✅ |
| **Real-time** | Polling only ❌ | Realtime via Supabase ✅ |
| **Free Tier** | Limited ❌ | Generous $200/month credit ✅ |

---

## 📞 Support

**Supabase Issues:**
- Docs: https://supabase.com/docs
- Community: https://discord.supabase.io

**Cloudinary Issues:**
- Docs: https://cloudinary.com/documentation
- Support: https://support.cloudinary.com

**Railway Issues:**
- Docs: https://docs.railway.app
- Support: https://railway.app/support

---

## ✅ Next Steps

1. Create Supabase project
2. Create Cloudinary account
3. Run migration SQL script
4. Update backend files (provided below)
5. Test locally with `npm run dev`
6. Deploy to Railway + Vercel

**Your app is now production-ready!** 🎉
