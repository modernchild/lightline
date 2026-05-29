# Lightline — Frontend-Backend Integration Status

**Last Updated:** May 27, 2026  
**Status:** ✅ **Fully Connected & Functional**

---

## 📊 Overview

The Lightline application has a complete bidirectional integration between frontend and backend with:
- ✅ **Authentication system** (Register, Login, Google OAuth, Password Reset)
- ✅ **8 AI content generation features** with streaming support
- ✅ **History & conversation memory** management
- ✅ **Privacy Policy & Terms of Conditions** integration
- ✅ **Rate limiting & security middleware**
- ✅ **Environment configuration** for both frontend and backend

---

## 🔐 Authentication System

### Backend Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/register` | Create new account |
| POST | `/api/auth/login` | Sign in with email/password |
| POST | `/api/auth/google` | Google OAuth authentication |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |
| GET | `/api/auth/me` | Get current user (protected) |

### Frontend Integration
**File:** [frontend/src/hooks/useAuth.jsx](frontend/src/hooks/useAuth.jsx)
**API Service:** [frontend/src/services/api.js](frontend/src/services/api.js)

**Features Implemented:**
- ✅ User registration with validation
- ✅ Email/password login
- ✅ Google Sign-In integration
- ✅ Password reset flow
- ✅ JWT token management (localStorage)
- ✅ Automatic token refresh on page load
- ✅ Session management
- ✅ Terms & Conditions + Privacy Policy checkboxes required on signup

**Usage:**
```jsx
const { login, register, loginWithGoogle, logout, user } = useAuth()

// Register
await register({ name: 'John', email: 'john@example.com', password: 'password123' })

// Login
await login({ email: 'john@example.com', password: 'password123' })

// Google OAuth
await loginWithGoogle(credentialResponse.credential)
```

---

## 🎨 AI Content Generation Features

### 8 Connected Endpoints

| Feature | Backend Endpoint | Frontend Method | Status |
|---------|-----------------|-----------------|--------|
| **Sermon Builder** | `/api/generate/sermon/quick` | `generateApi.sermonQuick()` | ✅ Streaming |
| **Sermon Deep** | `/api/generate/sermon/deep` | `generateApi.sermonDeep()` | ✅ Streaming |
| **Devotional** | `/api/generate/devotional` | `generateApi.devotional()` | ✅ Streaming |
| **WhatsApp Broadcast** | `/api/generate/whatsapp` | `generateApi.whatsapp()` | ✅ Streaming |
| **Bible Study** | `/api/generate/bible-study` | `generateApi.bibleStudy()` | ✅ Streaming |
| **Social Media** | `/api/generate/social` | `generateApi.social()` | ✅ Streaming |
| **Prayer & Declaration** | `/api/generate/prayer` | `generateApi.prayer()` | ✅ Streaming |
| **Evangelism Companion** | `/api/generate/evangelism` | `generateApi.evangelism()` | ✅ Streaming |

### Streaming Implementation
**Technology:** Server-Sent Events (SSE)
**Frontend:** [frontend/src/services/api.js](frontend/src/services/api.js) - `generateStream()` function
**Backend:** [backend/routes/generate.js](backend/routes/generate.js) - `runGeneration()` function

**Features:**
- ✅ Real-time text streaming as content generates
- ✅ Automatic token fallback if primary model fails
- ✅ Conversational memory support (multi-turn)
- ✅ RAG (Retrieval-Augmented Generation) context injection
- ✅ Automatic evaluation scoring
- ✅ History logging

**Example Frontend Usage:**
```jsx
const data = await generateApi.sermonQuick(
  {
    topic: 'Love in Action',
    scripture: 'John 13:34-35',
    occasion: 'Sunday Morning',
    duration: '45 minutes'
  },
  {
    onChunk: (chunk) => setOutput(prev => prev + chunk),
    stream: true,
    useMemory: true,
    evaluate: true
  }
)
```

---

## 📚 History & Conversation Management

### Backend Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/history` | List all generations (paginated) |
| GET | `/api/history/:id` | Get single generation |
| DELETE | `/api/history/:id` | Delete single generation |
| DELETE | `/api/history/all` | Delete all user history |
| GET | `/api/history/conversations` | List conversations by feature |
| DELETE | `/api/history/conversations/:id` | Delete conversation |
| DELETE | `/api/history/conversations/:id/messages` | Clear conversation memory |

### Frontend Integration
**API Methods:** [frontend/src/services/api.js](frontend/src/services/api.js) - `historyApi`

**Features:**
- ✅ Persistent history storage
- ✅ Conversation memory for multi-turn interactions
- ✅ Feature-based history filtering
- ✅ Individual and bulk deletion
- ✅ Memory clearing without history deletion

---

## 🤖 AI Model Management

### Backend Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/models` | List all available models & features |
| POST | `/api/models/test` | Test model availability |

### Model Configuration
**File:** [backend/config/models.js](backend/config/models.js)

**Current Model Chain (with automatic fallback):**

| Feature | Primary Model | Fallback | Provider |
|---------|----------------|----------|----------|
| Sermon Builder | Claude Sonnet | Claude 3 Haiku | Anthropic |
| Devotional | Claude Sonnet | Claude 3 Haiku | Anthropic |
| WhatsApp | GPT-4o Mini | Gemini Flash | OpenAI/Google |
| Social Media | Llama 3.1 70B | Claude 3 Haiku | Meta/Anthropic |
| Bible Study | Claude Sonnet | Claude 3 Haiku | Anthropic |
| Prayer | Claude Sonnet | Claude 3 Haiku | Anthropic |
| Evangelism | Claude Sonnet | Claude 3 Haiku | Anthropic |

---

## 🔒 Security & Middleware

### Authentication Middleware
**File:** [backend/middleware/auth.js](backend/middleware/auth.js)

**Protection:**
- ✅ JWT token validation
- ✅ Authorization header checking
- ✅ Protected routes enforcement

### Rate Limiting
**File:** [backend/server.js](backend/server.js) line 38-50

**Configuration:**
- ✅ Global: 100 requests per 15 minutes per IP
- ✅ Generation: 20 requests per 15 minutes per IP (expensive operations)
- ✅ Prevents abuse and brute-force attacks

### CORS Configuration
**File:** [backend/server.js](backend/server.js) line 21-27

**Settings:**
- ✅ Frontend origin: `http://localhost:5173` (development) → configurable
- ✅ Credentials allowed
- ✅ Proper headers configured

---

## 📋 Privacy Policy & Terms Integration

### Components
| Component | Status | Features |
|-----------|--------|----------|
| [PrivacyPolicyModal.jsx](frontend/src/components/auth/PrivacyPolicyModal.jsx) | ✅ Complete | Full policy with sections |
| [TermsConditionsModal.jsx](frontend/src/components/auth/TermsConditionsModal.jsx) | ✅ Complete | Full terms with sections |
| [AuthPage.jsx](frontend/src/components/auth/AuthPage.jsx) | ✅ Integrated | Checkbox on signup required |

### Signup Checkbox
**Location:** [AuthPage.jsx](frontend/src/components/auth/AuthPage.jsx) line 165-185

**Features:**
- ✅ Required checkbox for both policies
- ✅ Clickable links open modals
- ✅ Form validation prevents registration without agreement
- ✅ Styled with theme support

**User Experience:**
```
☑ I agree to the [Terms and Conditions] and [Privacy Policy]
```
- Users must check the box to proceed
- Links open beautiful scrollable modals
- Mobile responsive
- Dark/light theme support

---

## 🗄️ Database Integration

### SQLite Backend
**File:** [backend/db/database.js](backend/db/database.js)

**Tables:**
- ✅ `users` — User accounts, hashed passwords, profiles
- ✅ `generations` — AI-generated content with timestamps
- ✅ `conversations` — Memory for multi-turn interactions
- ✅ `evaluations` — User ratings and feedback

### Pinecone Vector Database
**Purpose:** RAG (Retrieval-Augmented Generation) context
**Configuration:** [backend/services/pinecone.js](backend/services/pinecone.js)

**Features:**
- ✅ Ministry knowledge base embeddings
- ✅ Semantic search for context injection
- ✅ Automatic fallback if unavailable

---

## 🌐 Environment Configuration

### Backend (.env)
**File:** [backend/.env](backend/.env)

```bash
PORT=5000
NODE_ENV=development
JWT_SECRET=<strong-random-string>
JWT_EXPIRES_IN=7d
OPENROUTER_API_KEY=sk-or-v1-xxxxx
PINECONE_API_KEY=pcsk_xxxxx
PINECONE_INDEX_NAME=lightline-ministry
FRONTEND_URL=http://localhost:5173
GOOGLE_CLIENT_ID=<your-client-id>
```

### Frontend (.env)
**File:** [frontend/.env](frontend/.env)

```bash
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=<your-client-id>
```

---

## 🎯 Current Features Status

### Fully Connected ✅
- [x] User authentication (email, password, Google)
- [x] Password reset flow
- [x] All 8 AI generation endpoints
- [x] Streaming responses (Server-Sent Events)
- [x] History management
- [x] Conversation memory
- [x] Model fallback system
- [x] Rate limiting
- [x] JWT authorization
- [x] Privacy & Terms modals
- [x] Signup agreement checkboxes
- [x] User context (Profile, settings)
- [x] Theme support (dark/light)
- [x] Responsive design

### Security Features ✅
- [x] Password hashing (bcrypt)
- [x] JWT tokens with expiry
- [x] Rate limiting per IP
- [x] CORS protection
- [x] Input validation
- [x] Error handling
- [x] Protected endpoints

---

## 🚀 How to Run Locally

### Prerequisites
```bash
node --version  # Must be 18+
npm --version   # Must be 9+
```

### Backend Setup
```bash
cd backend
npm install
npm start  # Starts on http://localhost:5000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev  # Starts on http://localhost:5173
```

### Verify Integration
1. Open http://localhost:5173
2. Click "Create Account"
3. Check the Privacy Policy link (should open modal)
4. Check the Terms link (should open modal)
5. Register a new account
6. After login, try generating content
7. Watch real-time streaming as content generates

---

## 📊 Data Flow Examples

### Registration → Login → Generation
```
1. User fills signup form
2. Frontend validates & shows Terms/Privacy
3. User checks agreement box
4. Frontend POST /api/auth/register
   ├─ Backend validates input
   ├─ Backend hashes password
   ├─ Backend stores user in SQLite
   └─ Backend returns JWT token
5. Frontend saves token to localStorage
6. User navigates to feature (e.g., Sermon Builder)
7. Frontend POST /api/generate/sermon/quick
   ├─ Backend validates JWT
   ├─ Backend fetches RAG context from Pinecone
   ├─ Backend calls OpenRouter API
   ├─ Backend streams chunks back via SSE
   ├─ Backend evaluates output
   └─ Backend saves to SQLite history
8. Frontend displays streamed content in real-time
```

### Conversation Memory Flow
```
1. User generates sermon (conversationId=null)
2. Backend creates new conversation
3. User clicks "Continue Conversation"
4. Frontend sends with conversationId + useMemory=true
5. Backend loads previous messages from SQLite
6. Backend injects memory into system prompt
7. Backend generates response with context
8. User maintains multi-turn conversation
```

---

## ✨ Recent Additions

1. **Privacy Policy Modal** — Full policy with all sections
2. **Terms & Conditions Modal** — Complete terms with 12 sections
3. **Signup Checkbox** — Required agreement before registration
4. **Clickable Policy Links** — Opens beautiful modals on click
5. **Webkit Fix** — Removed `-webkit-text-size-adjust` for proper mobile sizing
6. **Markdown Parser** — Utilities for parsing markdown to JSX (ready for future use)

---

## 🔧 Common Integration Points

### Adding a New Feature
1. Create backend endpoint in [backend/routes/generate.js](backend/routes/generate.js)
2. Add feature mapping in `FEATURE_MAP`
3. Create frontend component in [frontend/src/components/features/](frontend/src/components/features/)
4. Add API call to [frontend/src/services/api.js](frontend/src/services/api.js)
5. Add model configuration to [backend/config/models.js](backend/config/models.js)

### Modifying Authentication
- Backend logic: [backend/routes/auth.js](backend/routes/auth.js)
- Frontend hooks: [frontend/src/hooks/useAuth.jsx](frontend/src/hooks/useAuth.jsx)
- UI components: [frontend/src/components/auth/AuthPage.jsx](frontend/src/components/auth/AuthPage.jsx)

### Adjusting Rate Limits
- File: [backend/server.js](backend/server.js) line 38-50
- Global limit: Change `max: 100`
- Generation limit: Change `max: 20`

---

## 📞 Support & Documentation

- **Setup Guide:** [SETUP.md](SETUP.md)
- **Privacy Policy:** [PRIVACY_POLICY.md](PRIVACY_POLICY.md)
- **Terms & Conditions:** [TERMS_AND_CONDITIONS.md](TERMS_AND_CONDITIONS.md)
- **README:** [README.md](README.md)

---

**Summary:** The Lightline frontend and backend are fully integrated with complete authentication, 8 AI generation features, streaming responses, history management, security middleware, and proper error handling. The application is production-ready for local development and can be deployed to Railway (backend) and Vercel (frontend).
