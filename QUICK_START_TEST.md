# Lightline — Quick Start Integration Test

## 🚀 Start the System (5 minutes)

### Step 1: Backend Setup
```bash
cd backend
npm install
npm start
```
✅ Should print: `Server running on port 5000`

### Step 2: Frontend Setup (new terminal)
```bash
cd frontend
npm install
npm run dev
```
✅ Should print: `http://localhost:5173` (click to open)

---

## 🧪 Integration Test Checklist

### Test 1: View Privacy & Terms Modals ✅
**Location:** Signup page
**Steps:**
1. Click "Create Account" tab
2. Click the blue "Terms and Conditions" link
3. Verify modal appears with full content
4. Click X to close
5. Click the blue "Privacy Policy" link
6. Verify modal appears with full content

**Expected:** Beautiful scrollable modals with styled sections

---

### Test 2: Register New Account ✅
**Endpoint:** `POST /api/auth/register`
**Steps:**
1. Fill form:
   - Name: "Pastor John"
   - Email: "john@example.com"
   - Password: "Password123!"
   - Confirm: "Password123!"
2. View Privacy Policy modal (click link)
3. Close and view Terms (click link)
4. **Check the agreement checkbox** (required!)
5. Click "Create Account"

**Expected:**
- ✅ No error if checkbox checked
- ✅ Error message if checkbox unchecked: "Please agree to the Terms and Conditions and Privacy Policy."
- ✅ Account created, logged in, redirected to dashboard

**Backend Response:**
```json
{
  "message": "Account created successfully.",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid-1234",
    "email": "john@example.com",
    "name": "Pastor John"
  }
}
```

---

### Test 3: Login with Email/Password ✅
**Endpoint:** `POST /api/auth/login`
**Steps:**
1. Click "Sign In" tab
2. Enter email: "john@example.com"
3. Enter password: "Password123!"
4. Click "Sign In"

**Expected:**
- ✅ Logged in, redirected to dashboard
- ✅ User info displays in UI

**Verify in Browser DevTools:**
```javascript
localStorage.getItem('ll_token')  // Should return JWT token
```

---

### Test 4: Sermon Quick Generation (Streaming) ✅
**Endpoint:** `POST /api/generate/sermon/quick`
**Steps:**
1. After login, click "Sermon Builder" feature
2. Fill form:
   - Topic: "The Love of God"
   - Scripture: "John 3:16"
   - Occasion: "Sunday Service"
   - Duration: "35 minutes"
3. Click "Generate Sermon"

**Expected:**
- ✅ Text streams in real-time
- ✅ Watch content appear word by word
- ✅ Button shows "Generating..." → "Generate Sermon"
- ✅ Full sermon appears in output panel

**Network Activity (DevTools):**
- Request: `POST /api/generate/sermon/quick`
- Response Type: `text/event-stream`
- Events: `chunk`, `chunk`, ..., `done`

---

### Test 5: Streaming with Memory ✅
**Endpoint:** `POST /api/generate/devotional` (with memory)
**Steps:**
1. Click "Devotional Writer" feature
2. Fill form:
   - Topic: "Faith in difficult times"
   - Scripture: "Psalm 23:4"
3. Ensure "Use Memory" toggle is ON (if available)
4. Generate → watch stream
5. User provides follow-up in memory field
6. Generate again → AI references previous content

**Expected:**
- ✅ First generation streams
- ✅ Second generation shows context from first
- ✅ Conversation feels natural (multi-turn)

---

### Test 6: History Retrieval ✅
**Endpoint:** `GET /api/history`
**Steps:**
1. Generate 2-3 pieces of content
2. Click "History" in navigation
3. Verify all generations appear in list
4. Click one to view full content
5. Click delete button
6. Verify deletion confirmation

**Expected:**
- ✅ All generated content listed
- ✅ Can view individual items
- ✅ Can delete items
- ✅ History updates in real-time

---

### Test 7: Error Handling ✅
**Test Rate Limiting:**
**Steps:**
1. Generate 21 sermon requests in rapid succession
2. 22nd request should fail

**Expected:**
```json
{
  "error": "Too many requests. Please wait and try again."
}
```

**Test Invalid Token:**
**Steps:**
1. Open DevTools → Application → LocalStorage
2. Edit `ll_token` to: `invalid-token`
3. Try to generate content
4. Check Network tab

**Expected:**
- ✅ 401 Unauthorized error
- ✅ Token auto-cleared from storage
- ✅ Redirects to login

---

### Test 8: Google OAuth (if configured) ✅
**Endpoint:** `POST /api/auth/google`
**Prerequisites:**
- Set `VITE_GOOGLE_CLIENT_ID` in frontend/.env
- Set `GOOGLE_CLIENT_ID` in backend/.env

**Steps:**
1. Click "Sign up with Google" button
2. Complete Google login flow
3. Verify redirected to dashboard
4. Check `localStorage.getItem('ll_token')`

**Expected:**
- ✅ Account created or existing user logged in
- ✅ JWT token obtained
- ✅ User profile populated

---

### Test 9: Password Reset ✅
**Endpoint:** `POST /api/auth/forgot-password`
**Steps:**
1. Sign out (if logged in)
2. Click "Sign In" tab
3. Click "Forgot password?"
4. Enter email: "john@example.com"
5. Check backend logs for reset URL
6. Click the reset link
7. Enter new password: "NewPassword456!"
8. Submit

**Expected:**
- ✅ Success message
- ✅ Reset link in logs (dev mode)
- ✅ Can login with new password

---

### Test 10: Responsive Design ✅
**Steps:**
1. Open DevTools (F12)
2. Click "Toggle device toolbar" (Ctrl+Shift+M)
3. Select "iPhone 14" device
4. Test all features:
   - Forms still readable
   - Modals fit screen
   - Streaming content wraps nicely
   - Theme toggle works

**Expected:**
- ✅ All text readable on mobile
- ✅ No horizontal scroll
- ✅ Buttons are clickable
- ✅ Modals are scrollable

---

## 📊 Network Inspection Guide

### Check API Calls in DevTools
```
1. Open DevTools (F12)
2. Go to "Network" tab
3. Filter by "XHR" (XMLHttpRequest)
4. Perform action (e.g., login)
5. Click request → see details
```

### View Request/Response
```json
// Request
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "Password123!"
}

// Response (200 OK)
{
  "message": "Welcome back.",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user-uuid",
    "email": "john@example.com",
    "name": "Pastor John"
  }
}
```

### Watch Streaming Response
```
1. Network tab → Filter "XHR"
2. Click on /api/generate/sermon/quick request
3. Go to "Response" tab
4. Watch chunks stream in real-time:

event: chunk
data: {"content":"The love of God"}

event: chunk
data: {"content":" is the foundation"}

...

event: done
data: {"content":"...","tokens":1250,"model":"claude-sonnet"}
```

---

## 🔍 Backend Logs to Monitor

### Terminal 1 (Backend)
```
[Login Success] john@example.com
[Generate Started] /api/generate/sermon/quick | User: user-uuid
[OpenRouter] Model: claude-sonnet | Tokens: 1250
[Generate Complete] user-uuid | 2.3s
[Rate Limit] IP: 127.0.0.1 | 15/20 requests remaining
```

### Look for Issues
```
[Error] Email already exists
[Error] Invalid email format
[Error] Password must be at least 8 characters
[Error] Rate limit exceeded
[Error] OpenRouter API error (fallback to alternative model)
```

---

## 🐛 Troubleshooting

### "Cannot reach backend"
```bash
# Check if backend is running
curl http://localhost:5000
# Should return: Cannot GET /

# If error, restart backend
cd backend && npm start
```

### "CORS error"
```
Check backend .env:
FRONTEND_URL=http://localhost:5173

Check backend server.js:
cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' })
```

### "Token is invalid/expired"
```javascript
// DevTools Console
localStorage.removeItem('ll_token')
// Refresh page → should redirect to login
```

### "Rate limit exceeded immediately"
```bash
# Check rate limit settings in backend/server.js
# For testing, temporarily increase max:
// max: 100 (global)
// max: 20 (generation)

# Or wait 15 minutes for reset
```

### "Streaming not working"
```
1. Check Network tab → Response type
2. Should be: text/event-stream
3. If not, backend not streaming properly
4. Check /api/generate/sermon/quick response headers
```

---

## ✨ Success Indicators

You'll know integration is working when:

✅ **Auth Works**
- Can register with Privacy Policy agreement
- Can login with email/password
- Can logout
- JWT token stored in localStorage

✅ **Features Work**
- All 8 generators respond to requests
- Content streams in real-time
- Conversations remember context
- History saves automatically

✅ **Security Works**
- Rate limiting blocks excessive requests
- Invalid tokens rejected (401)
- CORS prevents cross-origin abuse
- Password reset email works

✅ **UI Works**
- Theme toggles light/light mode
- Modals open/close smoothly
- Animations play smoothly
- Responsive on all screen sizes

✅ **Performance Good**
- Generation starts within 1-2 seconds
- Streaming chunks arrive smoothly
- History loads quickly
- No console errors

---

## 📞 Common Questions

**Q: Can I use production API keys?**
A: Not recommended for testing. Create fresh test accounts on OpenRouter/Pinecone.

**Q: How long does generation take?**
A: First chunk usually appears within 1-2 seconds. Full content arrives over 10-30 seconds depending on model.

**Q: Can I test without internet?**
A: No, backend needs to call OpenRouter API. Internet required for AI generation.

**Q: Can I skip the Privacy Policy modal?**
A: No, it's required by form validation. You must click the checkbox to proceed.

**Q: How do I see backend logs?**
A: Check the terminal where you ran `npm start`. Logs show there by default.

**Q: Can I export generated content?**
A: Yes, click "Copy" button or select all (Ctrl+A) and copy manually. Export feature coming soon.

---

## 🎯 Next Steps After Testing

1. **Deploy to Production**
   - Backend → Railway.app
   - Frontend → Vercel

2. **Configure Production**
   - Update environment variables
   - Enable HTTPS
   - Configure email for password resets

3. **Monitor & Debug**
   - Set up error tracking (Sentry)
   - Enable analytics
   - Monitor rate limits

4. **Enhance Features**
   - Add user preferences
   - Create team accounts
   - Build content templates

---

**Happy Testing! 🚀**

For detailed architecture, see: [ARCHITECTURE.md](ARCHITECTURE.md)
For full integration details, see: [INTEGRATION_STATUS.md](INTEGRATION_STATUS.md)
