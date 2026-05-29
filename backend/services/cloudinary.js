// ─────────────────────────────────────────────
// services/cloudinary.js
// Cloudinary media upload and management
// ─────────────────────────────────────────────

const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

if (!process.env.CLOUDINARY_CLOUD_NAME) {
  console.warn('⚠️  CLOUDINARY_CLOUD_NAME not set — Media uploads disabled.');
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const CloudinaryService = {
  /**
   * Upload a file to Cloudinary
   * @param {Buffer} fileBuffer - File buffer from multer
   * @param {string} folder - Folder path in Cloudinary (e.g., 'lightline/avatars')
   * @param {string} publicId - Optional public ID for the file
   * @returns {Promise<{url: string, publicId: string}>}
   */
  async upload(fileBuffer, folder, publicId = null) {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: publicId,
          resource_type: 'auto',
          quality: 'auto',
          fetch_format: 'auto',
          secure: true,
        },
        (error, result) => {
          if (error) {
            console.error('[Cloudinary Upload Error]', error);
            return reject(new Error('Failed to upload file to Cloudinary.'));
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            size: result.bytes,
            format: result.format,
          });
        }
      );

      // Stream the buffer to Cloudinary
      streamifier.createReadStream(fileBuffer).pipe(stream);
    });
  },

  /**
   * Upload user avatar
   * @param {Buffer} fileBuffer - Avatar image buffer
   * @param {string} userId - User ID
   * @returns {Promise<string>} - Avatar URL
   */
  async uploadAvatar(fileBuffer, userId) {
    return CloudinaryService.upload(
      fileBuffer,
      'lightline/avatars',
      `avatar-${userId}`
    ).then(result => result.url);
  },

  /**
   * Delete a file from Cloudinary
   * @param {string} publicId - Public ID of the file
   * @returns {Promise<boolean>}
   */
  async delete(publicId) {
    try {
      await cloudinary.uploader.destroy(publicId);
      return true;
    } catch (error) {
      console.error('[Cloudinary Delete Error]', error);
      return false;
    }
  },

  /**
   * Get file URL with transformations
   * @param {string} publicId - Public ID of the file
   * @param {object} options - Transformation options
   * @returns {string} - Transformed URL
   */
  getUrl(publicId, options = {}) {
    return cloudinary.url(publicId, {
      secure: true,
      ...options,
    });
  },

  /**
   * Get optimized avatar URL
   * @param {string} publicId - Avatar public ID
   * @returns {string} - Optimized avatar URL
   */
  getAvatarUrl(publicId) {
    return CloudinaryService.getUrl(publicId, {
      width: 200,
      height: 200,
      crop: 'fill',
      gravity: 'face',
      quality: 'auto',
      fetch_format: 'auto',
    });
  },

  /**
   * Check if connected to Cloudinary
   * @returns {boolean}
   */
  isConfigured() {
    return !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );
  },
};

module.exports = CloudinaryService;
