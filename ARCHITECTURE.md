# Lightline — System Architecture & Integration Map

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         LIGHTLINE ECOSYSTEM                                 │
└─────────────────────────────────────────────────────────────────────────────┘

                            🌐 FRONTEND (Vite/React)
                        http://localhost:5173 (dev)
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
            ┌───────▼────────┐ ┌────▼─────────┐ ┌──▼──────────────┐
            │  AuthPage      │ │   Features   │ │    History      │
            │  - Login       │ │  - Sermon    │ │    - View List  │
            │  - Register    │ │  - Prayer    │ │    - Delete     │
            │  - Google Auth │ │  - Study     │ │    - Memory     │
            │  - P&T Modal   │ │  - Social    │ │                 │
            └────────────────┘ └──────────────┘ └─────────────────┘
                    │                │                    │
                    └────────────────┼────────────────────┘
                                     │
                    API Service Layer (api.js)
        ┌───────────────────────────────────────────────────┐
        │                                                   │
        │  authApi  │ generateApi  │ historyApi  │ modelsApi │
        │                                                   │
        └───────────────┬───────────────────────────────────┘
                        │ HTTP + JWT Token
                        │ (Authorization: Bearer <token>)
                        │
                        ▼
                ⚙️ BACKEND (Express.js)
            http://localhost:5000 (dev)
                        │
    ┌───────────────────┼───────────────────┐
    │                   │                   │
    ▼                   ▼                   ▼
┌─────────────┐  ┌──────────────┐  ┌─────────────┐
│ Auth Routes │  │Generate Route│  │ History API │
│             │  │              │  │             │
│ POST /auth/ │  │POST /generate│  │GET /history │
│  - register │  │ /sermon/quick│  │DELETE items │
│  - login    │  │ /devotional  │  │             │
│  - google   │  │ /prayer      │  └─────────────┘
│  - reset    │  │ /social      │
└─────────────┘  │ /whatsapp    │
                 │ /evangelism  │
                 │ /bible-study │
                 │ + streaming  │
                 └──────┬───────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
    🔐 Middleware   📦 Services    🗄️ Databases
    - Auth check   - OpenRouter    - SQLite
    - Rate limit   - Pinecone      (users, history,
    - Error handle - Memory        conversations,
                   - Evaluation    evaluations)


                      🔗 EXTERNAL SERVICES

    ┌────────────────────────────────────────────────────┐
    │                                                    │
    │  🤖 OpenRouter (AI Models)                        │
    │  ├─ Claude (Anthropic)                            │
    │  ├─ GPT-4o (OpenAI)                               │
    │  ├─ Llama (Meta)                                  │
    │  └─ Gemini (Google)                               │
    │                                                    │
    │  📍 Pinecone (Vector Database)                    │
    │  ├─ Ministry knowledge embeddings                │
    │  ├─ Semantic search for RAG                       │
    │  └─ Context injection                             │
    │                                                    │
    │  🔑 Google OAuth                                  │
    │  └─ User authentication                           │
    │                                                    │
    └────────────────────────────────────────────────────┘


                    📊 DATA FLOW EXAMPLE

    User Signup → Privacy Policy Modal
    (Clickable Links)
           │
           ▼
    Agree to Terms? [✓]
           │
           ▼
    POST /api/auth/register
    { name, email, password }
           │
           ▼
    Backend Validates + Hashes Password
           │
           ▼
    SQLite: INSERT INTO users
           │
           ▼
    Generate JWT Token
           │
           ▼
    Response: { token, user }
           │
           ▼
    Frontend: localStorage.setItem('ll_token')
           │
           ▼
    User Navigates to Feature
           │
           ▼
    POST /api/generate/sermon/quick
    Authorization: Bearer <token>
    { topic, scripture, ... }
           │
           ▼
    Backend: Validate Token ✓
           │
           ▼
    Fetch RAG Context from Pinecone
           │
           ▼
    Call OpenRouter API (streaming)
           │
           ▼
    Server-Sent Events (SSE) Response
    event: chunk
    data: "Generated text..."
           │
           ▼
    Frontend: Real-time Streaming Display
           │
           ▼
    Backend: Save to SQLite history
           │
           ▼
    User Sees Streamed Content ✓


                    🔐 SECURITY LAYERS

    ┌─────────────────────────────────────┐
    │  Rate Limiting                       │
    │  ├─ Global: 100 req/15min per IP    │
    │  └─ Generate: 20 req/15min per IP   │
    ├─────────────────────────────────────┤
    │  JWT Token Auth                      │
    │  ├─ Token: localStorage('ll_token') │
    │  ├─ Expiry: 7 days                  │
    │  └─ Secret: 64-char random          │
    ├─────────────────────────────────────┤
    │  Password Hashing                    │
    │  ├─ Algorithm: bcrypt               │
    │  ├─ Work Factor: 12                 │
    │  └─ Never stored in plaintext       │
    ├─────────────────────────────────────┤
    │  CORS Protection                     │
    │  ├─ Origin: http://localhost:5173   │
    │  ├─ Credentials: allowed            │
    │  └─ Methods: GET, POST, DELETE      │
    ├─────────────────────────────────────┤
    │  Input Validation                    │
    │  ├─ Email format check              │
    │  ├─ Password length (8+ chars)      │
    │  └─ Required field check            │
    └─────────────────────────────────────┘


                    📱 USER JOURNEY

    1. LANDING
       └─ User visits http://localhost:5173
       
    2. AUTHENTICATION
       ├─ Sign In → Existing user login
       ├─ Create Account → New registration
       │  └─ See Privacy Policy modal [clickable]
       │  └─ See Terms modal [clickable]
       │  └─ Check agreement box [required]
       │  └─ Submit → Backend stores user → JWT returned
       └─ Google OAuth → Quick sign-up
       
    3. DASHBOARD
       └─ Authenticated user sees feature menu
       
    4. CONTENT GENERATION
       ├─ Select feature (e.g., Sermon Builder)
       ├─ Fill form (topic, scripture, etc.)
       ├─ Submit → Backend processes with AI
       ├─ Stream chunks back in real-time
       ├─ Display as content arrives
       └─ Save to history automatically
       
    5. HISTORY MANAGEMENT
       ├─ View past generations
       ├─ Continue conversations (multi-turn)
       ├─ Delete individual items
       ├─ Clear memory
       └─ Export or share


                    🎯 FEATURE ENDPOINTS

    ┌──────────────────────────────────────────┐
    │ Sermon Builder                           │
    │ POST /api/generate/sermon/quick          │ Streaming
    │ POST /api/generate/sermon/deep           │ Multi-step
    ├──────────────────────────────────────────┤
    │ Devotional Writer                        │
    │ POST /api/generate/devotional            │ Streaming
    ├──────────────────────────────────────────┤
    │ Prayer & Declaration                     │
    │ POST /api/generate/prayer                │ Streaming
    ├──────────────────────────────────────────┤
    │ Bible Study Guide                        │
    │ POST /api/generate/bible-study           │ Streaming
    ├──────────────────────────────────────────┤
    │ Social Media Content                     │
    │ POST /api/generate/social                │ Streaming
    ├──────────────────────────────────────────┤
    │ WhatsApp Broadcast                       │
    │ POST /api/generate/whatsapp              │ Streaming
    ├──────────────────────────────────────────┤
    │ Evangelism Companion                     │
    │ POST /api/generate/evangelism            │ Streaming
    ├──────────────────────────────────────────┤
    │ Models Management                        │
    │ GET /api/models                          │ List models
    │ POST /api/models/test                    │ Test models
    └──────────────────────────────────────────┘


                    💾 DATABASE SCHEMA

    users
    ├─ id (UUID)
    ├─ email (unique)
    ├─ name
    ├─ password_hash (bcrypt)
    ├─ google_id (optional)
    ├─ avatar_url (optional)
    └─ created_at

    generations
    ├─ id (UUID)
    ├─ user_id (FK)
    ├─ feature (sermon, prayer, etc.)
    ├─ input (user request)
    ├─ output (AI response)
    ├─ model_used
    ├─ evaluation_score (1-5)
    └─ created_at

    conversations
    ├─ id (UUID)
    ├─ user_id (FK)
    ├─ feature
    ├─ title
    └─ created_at

    messages (in-memory during session)
    ├─ role (user/assistant)
    ├─ content
    └─ timestamp


                    🚀 DEPLOYMENT TARGETS

    Backend: Railway.app
    ├─ Auto-deploy from GitHub
    ├─ Environment variables configured
    ├─ Production database (PostgreSQL)
    └─ URL: https://lightline-api.railway.app

    Frontend: Vercel
    ├─ Auto-deploy from GitHub
    ├─ Environment variables configured
    ├─ CDN + edge functions
    └─ URL: https://lightline.vercel.app


                    ✅ INTEGRATION CHECKLIST

    Authentication
    ├─ [✓] Email/password registration
    ├─ [✓] Email/password login
    ├─ [✓] Google OAuth
    ├─ [✓] Password reset flow
    ├─ [✓] JWT token management
    └─ [✓] Privacy & Terms modals

    Content Generation
    ├─ [✓] All 8 features connected
    ├─ [✓] Streaming responses (SSE)
    ├─ [✓] Multi-turn conversations
    ├─ [✓] RAG context injection
    ├─ [✓] Automatic evaluation
    └─ [✓] Model fallback system

    History & Memory
    ├─ [✓] Save generations
    ├─ [✓] Conversation memory
    ├─ [✓] History retrieval
    ├─ [✓] Deletion (item/all)
    └─ [✓] Memory clearing

    Security
    ├─ [✓] Rate limiting
    ├─ [✓] JWT authorization
    ├─ [✓] Password hashing
    ├─ [✓] CORS protection
    └─ [✓] Input validation

    UI/UX
    ├─ [✓] Theme support (dark/light)
    ├─ [✓] Responsive design
    ├─ [✓] Modal dialogs
    ├─ [✓] Form validation
    └─ [✓] Error handling
```

---

## Key Integration Points Summary

1. **Authentication System** — Complete OAuth + Email/Password flow
2. **8 AI Endpoints** — All features streaming and functional
3. **Real-time Streaming** — Server-Sent Events for instant feedback
4. **Conversation Memory** — Multi-turn interactions with context
5. **History Management** — Full CRUD operations on past content
6. **Security Middleware** — Rate limiting, JWT auth, validation
7. **Privacy & Terms** — Clickable modals with required checkbox
8. **Model Fallback** — Automatic model switching if primary fails
9. **Database Integration** — SQLite for development, ready for PostgreSQL
10. **Error Handling** — Comprehensive error responses and logging

The system is **production-ready** and can handle real ministry workflows!
