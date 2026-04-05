const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { v4: uuid } = require('uuid');
const { dbGet, dbRun } = require('../models/db');
const { JWT_SECRET } = require('../middleware/auth');
const now = () => new Date().toISOString().replace('T',' ').slice(0,19);

function register(req, res) {
  const { name, email, password, role = 'viewer' } = req.body;
  if (dbGet('SELECT id FROM users WHERE email=?', [email]))
    return res.status(409).json({ error: 'Email already registered' });
  const id = uuid(), n = now();
  dbRun('INSERT INTO users(id,name,email,password,role,created_at,updated_at) VALUES(?,?,?,?,?,?,?)',
    [id, name, email, bcrypt.hashSync(password,10), role, n, n]);
  res.status(201).json({ message: 'User created', userId: id, role });
}

function login(req, res) {
  const { email, password } = req.body;
  const user = dbGet('SELECT * FROM users WHERE email=?', [email]);
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'Invalid credentials' });
  if (user.status !== 'active')
    return res.status(403).json({ error: 'Account inactive' });
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}

module.exports = { register, login };
