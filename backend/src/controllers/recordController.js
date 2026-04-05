const { v4: uuid } = require('uuid');
const { dbGet, dbAll, dbRun } = require('../models/db');
const now = () => new Date().toISOString().replace('T',' ').slice(0,19);

function listRecords(req, res) {
  const { type, category, date_from, date_to, page=1, limit=20 } = req.query;
  let where = 'WHERE r.deleted_at IS NULL', p = [];
  if (type)      { where += ' AND r.type=?';     p.push(type); }
  if (category)  { where += ' AND r.category=?'; p.push(category); }
  if (date_from) { where += ' AND r.date>=?';    p.push(date_from); }
  if (date_to)   { where += ' AND r.date<=?';    p.push(date_to); }

  const base = `FROM financial_records r JOIN users u ON r.created_by=u.id ${where}`;
  const total = (dbGet(`SELECT COUNT(*) as c ${base}`, p)||{c:0}).c;
  const pg = Math.max(1,+page), lm = Math.min(+limit||20,100);
  const records = dbAll(`SELECT r.*,u.name AS created_by_name ${base} ORDER BY r.date DESC LIMIT ? OFFSET ?`, [...p, lm, (pg-1)*lm]);
  res.json({ total, page:pg, limit:lm, pages:Math.ceil(total/lm), records });
}

function getRecord(req, res) {
  const r = dbGet(`SELECT r.*,u.name AS created_by_name FROM financial_records r JOIN users u ON r.created_by=u.id WHERE r.id=? AND r.deleted_at IS NULL`, [req.params.id]);
  if (!r) return res.status(404).json({ error: 'Not found' });
  res.json(r);
}

function createRecord(req, res) {
  const { amount, type, category, date, notes } = req.body;
  const id=uuid(), n=now();
  dbRun('INSERT INTO financial_records(id,amount,type,category,date,notes,created_by,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)',
    [id, +amount, type, category.trim(), date, notes||null, req.user.id, n, n]);
  res.status(201).json({ message:'Created', record: dbGet('SELECT * FROM financial_records WHERE id=?',[id]) });
}

function updateRecord(req, res) {
  if (!dbGet('SELECT id FROM financial_records WHERE id=? AND deleted_at IS NULL',[req.params.id]))
    return res.status(404).json({ error:'Not found' });
  const { amount, type, category, date, notes } = req.body;
  const fields=[], p=[];
  if (amount!==undefined) { fields.push('amount=?');   p.push(+amount); }
  if (type)               { fields.push('type=?');     p.push(type); }
  if (category)           { fields.push('category=?'); p.push(category.trim()); }
  if (date)               { fields.push('date=?');     p.push(date); }
  if (notes!==undefined)  { fields.push('notes=?');    p.push(notes); }
  if (!fields.length) return res.status(400).json({ error:'Nothing to update' });
  fields.push('updated_at=?'); p.push(now(), req.params.id);
  dbRun(`UPDATE financial_records SET ${fields.join(',')} WHERE id=?`, p);
  res.json({ message:'Updated', record: dbGet('SELECT * FROM financial_records WHERE id=?',[req.params.id]) });
}

function deleteRecord(req, res) {
  if (!dbGet('SELECT id FROM financial_records WHERE id=? AND deleted_at IS NULL',[req.params.id]))
    return res.status(404).json({ error:'Not found' });
  dbRun('UPDATE financial_records SET deleted_at=? WHERE id=?',[now(), req.params.id]);
  res.json({ message:'Record soft-deleted' });
}

module.exports = { listRecords, getRecord, createRecord, updateRecord, deleteRecord };
