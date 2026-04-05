const jwt = require('jsonwebtoken');
const { dbGet } = require('../models/db');

const JWT_SECRET = process.env.JWT_SECRET || 'finance-dashboard-secret';

function authenticate(req, res, next) {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' });
  try {
    const payload = jwt.verify(h.slice(7), JWT_SECRET);
    const user = dbGet('SELECT id,name,email,role,status FROM users WHERE id=?', [payload.id]);
    if (!user) return res.status(401).json({ error: 'User not found' });
    if (user.status !== 'active') return res.status(403).json({ error: 'Account inactive' });
    req.user = user;
    next();
  } catch { res.status(401).json({ error: 'Invalid or expired token' }); }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role))
      return res.status(403).json({ error: `Requires role: ${roles.join(' or ')}` });
    next();
  };
}

module.exports = { authenticate, authorize, JWT_SECRET };
