const { dbGet, dbAll } = require('../models/db');

function getSummary(req, res) {
  const { date_from, date_to } = req.query;
  let where='WHERE deleted_at IS NULL', p=[];
  if (date_from) { where+=' AND date>=?'; p.push(date_from); }
  if (date_to)   { where+=' AND date<=?'; p.push(date_to); }
  const s = dbGet(`SELECT COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE 0 END),0) AS total_income, COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END),0) AS total_expenses, COUNT(*) AS total_records FROM financial_records ${where}`, p);
  s.net_balance = +((s.total_income||0)-(s.total_expenses||0)).toFixed(2);
  const by_category = dbAll(`SELECT category,type,ROUND(SUM(amount),2) AS total,COUNT(*) AS count FROM financial_records ${where} GROUP BY category,type ORDER BY total DESC`, p);
  res.json({ summary:s, by_category });
}

function getTrends(req, res) {
  const { year } = req.query;
  let where='WHERE deleted_at IS NULL', p=[];
  if (year) { where+=" AND strftime('%Y',date)=?"; p.push(year); }
  const trends = dbAll(`SELECT strftime('%Y-%m',date) AS month, ROUND(SUM(CASE WHEN type='income' THEN amount ELSE 0 END),2) AS income, ROUND(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END),2) AS expenses, COUNT(*) AS transactions FROM financial_records ${where} GROUP BY month ORDER BY month ASC`, p);
  res.json({ trends });
}

function getRecent(req, res) {
  const limit = Math.min(+(req.query.limit)||10, 50);
  const records = dbAll(`SELECT r.id,r.amount,r.type,r.category,r.date,r.notes,u.name AS created_by_name FROM financial_records r JOIN users u ON r.created_by=u.id WHERE r.deleted_at IS NULL ORDER BY r.date DESC,r.created_at DESC LIMIT ?`, [limit]);
  res.json({ recent: records });
}

module.exports = { getSummary, getTrends, getRecent };
