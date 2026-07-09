// ─────────────────────────────────────────────
// routes/upload.js
// File upload endpoints (avatars, documents, etc)
// ─────────────────────────────────────────────

const express = require('express');
const multer = require('multer');
const CloudinaryService = require('../services/cloudinary');
const UserStore = require('../config/userStore');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Multer configuration for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Please upload a valid image file (JPG, PNG, GIF, or WebP).'));
    }
  },
});

/**
 * POST /api/upload/avatar
 * Upload and update user avatar
 */
router.post('/avatar', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please select an image to upload.' });
    }

    if (!CloudinaryService.isConfigured()) {
      return res.status(503).json({ error: 'Image upload is temporarily unavailable. Please try again later.' });
    }

    const userId = req.user.id;

    // Upload to Cloudinary
    const avatarUrl = await CloudinaryService.uploadAvatar(req.file.buffer, userId);

    // Update user profile
    await UserStore.updateProfile(userId, {
      avatar_url: avatarUrl,
    });

    res.json({
      message: 'Avatar updated successfully.',
      avatarUrl,
    });
  } catch (err) {
    console.error('[Upload Error]', err);
    res.status(500).json({ error: 'We couldn\'t upload your image. Please check the file size (max 5MB) and try again.' });
  }
});

/**
 * DELETE /api/upload/avatar
 * Remove user avatar
 */
router.delete('/avatar', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get current user
    const user = await UserStore.findById(userId);
    if (!user?.avatar_url) {
      return res.status(404).json({ error: 'You don\'t have an image to remove yet.' });
    }

    // Extract public ID from Cloudinary URL and delete
    const publicId = `lightline/avatars/avatar-${userId}`;
    await CloudinaryService.delete(publicId);

    // Clear avatar from profile
    await UserStore.updateProfile(userId, {
      avatar_url: null,
    });

    res.json({ message: 'Avatar deleted successfully.' });
  } catch (err) {
    console.error('[Delete Avatar Error]', err);
    res.status(500).json({ error: 'We couldn\'t remove your image. Please try again.' });
  }
});

module.exports = router;
