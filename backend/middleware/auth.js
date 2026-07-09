// ─────────────────────────────────────────────
// middleware/auth.js
// JWT verification middleware
// ─────────────────────────────────────────────

const jwt = require('jsonwebtoken');

/**
 * Attaches req.user = { id, email, name } if token is valid.
 * Returns 401 if missing or invalid, 403 if expired.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  // Expected format: "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Your session has ended. Please sign in again to continue.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(403).json({ error: 'Your session has expired. Please sign in again.' });
      }
      return res.status(403).json({ error: 'Your session is no longer valid. Please sign in again.' });
    }
    req.user = user;
    next();
  });
}

module.exports = { authenticateToken };
