// ─────────────────────────────────────────────
// config/userStore.js
// Simple in-memory user store for v1.
// Replace with a real database (PostgreSQL, MongoDB)
// when you scale beyond a single server instance.
// ─────────────────────────────────────────────

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const users = new Map();
const resetTokens = new Map();

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

const UserStore = {
  async create({ name, email, password, googleId = null, avatar = null }) {
    const normalizedEmail = email.toLowerCase().trim();
    if (users.has(normalizedEmail)) {
      throw new Error('An account with this email already exists.');
    }
    const user = {
      id: uuidv4(),
      name: name.trim(),
      email: normalizedEmail,
      password: password ? await UserStore.hashPassword(password) : null,
      googleId,
      avatar,
      createdAt: new Date().toISOString(),
    };
    users.set(user.email, user);
    return UserStore.sanitize(user);
  },

  async findOrCreateGoogle({ googleId, email, name, avatar }) {
    const normalizedEmail = email.toLowerCase().trim();
    let user = users.get(normalizedEmail);

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        if (avatar && !user.avatar) user.avatar = avatar;
      }
      return UserStore.sanitize(user);
    }

    return UserStore.create({
      name: name || normalizedEmail.split('@')[0],
      email: normalizedEmail,
      password: null,
      googleId,
      avatar,
    });
  },

  async findAndVerify({ email, password }) {
    const user = users.get(email.toLowerCase().trim());
    if (!user || !user.password) return null;
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return null;
    return UserStore.sanitize(user);
  },

  findById(id) {
    for (const user of users.values()) {
      if (user.id === id) return UserStore.sanitize(user);
    }
    return null;
  },

  findByEmail(email) {
    const user = users.get(email.toLowerCase().trim());
    return user ? UserStore.sanitize(user) : null;
  },

  async createResetToken(email) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = users.get(normalizedEmail);
    if (!user) return null;

    const token = crypto.randomBytes(32).toString('hex');
    resetTokens.set(token, {
      userId: user.id,
      email: normalizedEmail,
      expiresAt: Date.now() + RESET_TOKEN_TTL_MS,
    });
    return token;
  },

  async resetPasswordWithToken(token, newPassword) {
    const record = resetTokens.get(token);
    if (!record || record.expiresAt < Date.now()) {
      resetTokens.delete(token);
      return null;
    }

    const user = users.get(record.email);
    if (!user) {
      resetTokens.delete(token);
      return null;
    }

    user.password = await UserStore.hashPassword(newPassword);
    resetTokens.delete(token);
    return UserStore.sanitize(user);
  },

  async hashPassword(password) {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  },

  sanitize(user) {
    const { password, ...safe } = user;
    return safe;
  },
};

module.exports = UserStore;
