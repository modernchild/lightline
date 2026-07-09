// ─────────────────────────────────────────────
// routes/auth.js
// POST /api/auth/register
// POST /api/auth/login
// POST /api/auth/google
// POST /api/auth/forgot-password
// POST /api/auth/reset-password
// GET  /api/auth/me   (protected)
// ─────────────────────────────────────────────

const express = require('express');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const UserStore = require('../config/userStore');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please enter your name, email, and password.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Your password must be at least 8 characters long for security.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const user = await UserStore.create({ name, email, password });
    const token = signToken(user);

    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user,
    });
  } catch (err) {
    if (err.message.includes('already exists')) {
      return res.status(409).json({ error: err.message });
    }
    console.error('[Register Error]', err);
    res.status(500).json({ error: 'We couldn\'t create your account. Please check your details and try again.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter your email and password.' });
    }

    const user = await UserStore.findAndVerify({ email, password });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signToken(user);

    res.json({
      message: 'Welcome back.',
      token,
      user,
    });
  } catch (err) {
    console.error('[Login Error]', err);
    res.status(500).json({ error: 'Sign in didn\'t work. Please try again or contact support.' });
  }
});

router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Unable to complete Google sign-in. Please try again.' });
    }
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(503).json({ error: 'Google sign-in is temporarily unavailable. Please use another sign-in method.' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email) {
      return res.status(401).json({ error: 'Unable to retrieve email from your Google account. Please try another account.' });
    }

    const user = await UserStore.findOrCreateGoogle({
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      avatar: payload.picture,
    });

    const token = signToken(user);

    res.json({
      message: 'Signed in with Google.',
      token,
      user,
    });
  } catch (err) {
    console.error('[Google Auth Error]', err);
    res.status(401).json({ error: 'Google sign-in didn\'t work this time. Please try again or use another sign-in method.' });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Please enter your email address.' });
    }

    const token = await UserStore.createResetToken(email);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  // Always return the same message to avoid user enumeration
    const response = {
      message: 'If an account exists for that email, password reset instructions have been sent.',
    };

    if (token && process.env.NODE_ENV === 'development') {
      response.resetUrl = `${frontendUrl}/auth?reset=${token}`;
    }

    if (token) {
      console.log(`[Password Reset] ${email} → ${frontendUrl}/auth?reset=${token}`);
    }

    res.json(response);
  } catch (err) {
    console.error('[Forgot Password Error]', err);
    res.status(500).json({ error: 'We couldn\'t process your request. Please try again or contact support.' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Reset link and new password are required. Please try the password reset process again.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Your new password must be at least 8 characters long.' });
    }

    const user = await UserStore.resetPasswordWithToken(token, password);
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset link. Please request a new one.' });
    }

    res.json({ message: 'Password updated successfully. You can sign in now.' });
  } catch (err) {
    console.error('[Reset Password Error]', err);
    res.status(500).json({ error: 'We couldn\'t update your password. Please try again or request a new reset link.' });
  }
});

router.get('/me', authenticateToken, (req, res) => {
  const user = UserStore.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'Your account could not be found. Please sign in again.' });
  }
  res.json({ user });
});

module.exports = router;
