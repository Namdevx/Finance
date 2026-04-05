const { dbGet, dbAll, dbRun } = require('../models/db');
const SAFE = 'id,name,email,role,status,created_at,updated_at';
const now = () => new Date().toISOString().replace('T',' ').slice(0,19);

function listUsers(req, res) {
  const { role, status } = req.query;
  let sql = `SELECT ${SAFE} FROM users WHERE 1=1`, p = [];
  if (role)   { sql += ' AND role=?';   p.push(role); }
  if (status) { sql += ' AND status=?'; p.push(status); }
  const users = dbAll(sql + ' ORDER BY created_at DESC', p);
  res.json({ count: users.length, users });
}

function getUser(req, res) {
  const user = dbGet(`SELECT ${SAFE} FROM users WHERE id=?`, [req.params.id]);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
}

function updateUser(req, res) {
  if (!dbGet('SELECT id FROM users WHERE id=?', [req.params.id]))
    return res.status(404).json({ error: 'User not found' });
  if (req.params.id === req.user.id && req.body.role && req.body.role !== 'admin')
    return res.status(400).json({ error: 'Cannot change own role' });
  const { role, status, name } = req.body;
  const fields = [], p = [];
  if (role)   { fields.push('role=?');   p.push(role); }
  if (status) { fields.push('status=?'); p.push(status); }
  if (name)   { fields.push('name=?');   p.push(name); }
  if (!fields.length) return res.status(400).json({ error: 'Nothing to update' });
  fields.push('updated_at=?'); p.push(now(), req.params.id);
  dbRun(`UPDATE users SET ${fields.join(',')} WHERE id=?`, p);
  res.json({ message: 'Updated', user: dbGet(`SELECT ${SAFE} FROM users WHERE id=?`, [req.params.id]) });
}

function deleteUser(req, res) {
  if (req.params.id === req.user.id) return res.status(400).json({ error: 'Cannot delete yourself' });
  if (!dbGet('SELECT id FROM users WHERE id=?', [req.params.id]))
    return res.status(404).json({ error: 'User not found' });
  dbRun('DELETE FROM users WHERE id=?', [req.params.id]);
  res.json({ message: 'User deleted' });
}

module.exports = { listUsers, getUser, updateUser, deleteUser };
