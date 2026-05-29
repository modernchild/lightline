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
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(403).json({ error: 'Session expired. Please log in again.' });
      }
      return res.status(403).json({ error: 'Invalid token.' });
    }
    req.user = user;
    next();
  });
}

module.exports = { authenticateToken };
