// ─────────────────────────────────────────────
// config/userStore.js (v2 - Supabase)
// User authentication and profile management
// Uses PostgreSQL via Supabase
// ─────────────────────────────────────────────

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const supabase = require('../services/supabase');

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

const UserStore = {
  /**
   * Create a new user account
   */
  async create({ name, email, password, googleId = null, avatar = null }) {
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .single();

    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    // Hash password if provided
    const passwordHash = password ? await UserStore.hashPassword(password) : null;

    // Create new user
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        id: uuidv4(),
        name: name.trim(),
        email: normalizedEmail,
        password_hash: passwordHash,
        google_id: googleId,
        avatar_url: avatar,
      })
      .select()
      .single();

    if (error) {
      console.error('[UserStore Create Error]', error);
      throw new Error('We couldn\'t create your account. Please try again or contact support.' );
    }

    return UserStore.sanitize(user);
  },

  /**
   * Find or create user from Google OAuth
   */
  async findOrCreateGoogle({ googleId, email, name, avatar }) {
    const normalizedEmail = email.toLowerCase().trim();

    // Try to find existing user
    let { data: user } = await supabase
      .from('users')
      .select()
      .eq('email', normalizedEmail)
      .single();

    if (user) {
      // Update Google ID and avatar if missing
      if (!user.google_id) {
        const { data: updated } = await supabase
          .from('users')
          .update({
            google_id: googleId,
            avatar_url: avatar || user.avatar_url,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)
          .select()
          .single();
        user = updated;
      }
      return UserStore.sanitize(user);
    }

    // Create new user from Google
    return UserStore.create({
      name: name || normalizedEmail.split('@')[0],
      email: normalizedEmail,
      password: null,
      googleId,
      avatar,
    });
  },

  /**
   * Find and verify user by email and password
   */
  async findAndVerify({ email, password }) {
    const normalizedEmail = email.toLowerCase().trim();

    const { data: user, error } = await supabase
      .from('users')
      .select()
      .eq('email', normalizedEmail)
      .single();

    if (error || !user || !user.password_hash) {
      return null;
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    return valid ? UserStore.sanitize(user) : null;
  },

  /**
   * Find user by ID
   */
  async findById(id) {
    const { data: user, error } = await supabase
      .from('users')
      .select()
      .eq('id', id)
      .single();

    return error || !user ? null : UserStore.sanitize(user);
  },

  /**
   * Find user by email
   */
  async findByEmail(email) {
    const normalizedEmail = email.toLowerCase().trim();

    const { data: user, error } = await supabase
      .from('users')
      .select()
      .eq('email', normalizedEmail)
      .single();

    return error || !user ? null : UserStore.sanitize(user);
  },

  /**
   * Update user profile
   */
  async updateProfile(userId, updates) {
    const { data: user, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('[UserStore Update Error]', error);
      throw new Error('We couldn\'t update your profile. Please try again.' );
    }

    return UserStore.sanitize(user);
  },

  /**
   * Create a password reset token
   */
  async createResetToken(email) {
    const normalizedEmail = email.toLowerCase().trim();

    // Find user
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .single();

    if (!user) return null;

    // Generate and store token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS).toISOString();

    const { error } = await supabase.from('reset_tokens').insert({
      id: uuidv4(),
      user_id: user.id,
      token,
      expires_at: expiresAt,
    });

    if (error) {
      console.error('[Reset Token Error]', error);
      return null;
    }

    return token;
  },

  /**
   * Reset password with token
   */
  async resetPasswordWithToken(token, newPassword) {
    // Find valid token
    const { data: tokenRecord, error: tokenError } = await supabase
      .from('reset_tokens')
      .select('user_id')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (tokenError || !tokenRecord) {
      // Delete expired token if it exists
      await supabase.from('reset_tokens').delete().eq('token', token);
      return null;
    }

    // Hash new password
    const passwordHash = await UserStore.hashPassword(newPassword);

    // Update user password
    const { data: user, error: updateError } = await supabase
      .from('users')
      .update({
        password_hash: passwordHash,
        updated_at: new Date().toISOString(),
      })
      .eq('id', tokenRecord.user_id)
      .select()
      .single();

    if (updateError) {
      console.error('[Reset Password Error]', updateError);
      return null;
    }

    // Mark token as used
    await supabase
      .from('reset_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('token', token);

    return UserStore.sanitize(user);
  },

  /**
   * Hash password with bcrypt
   */
  async hashPassword(password) {
    return bcrypt.hash(password, 12);
  },

  /**
   * Remove sensitive fields from user object
   */
  sanitize(user) {
    if (!user) return null;
    const { password_hash, google_id, ...safe } = user;
    return {
      ...safe,
      googleId: google_id,
    };
  },
};

module.exports = UserStore;
