const initSqlJs = require('sql.js');
const fs   = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/finance.db');
let db = null;

function persist() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
}

async function initSchema() {
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    db = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    db = new SQL.Database();
  }
  db.run('PRAGMA foreign_keys = ON');
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('viewer','analyst','admin')),
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','inactive')),
    created_at TEXT NOT NULL, updated_at TEXT NOT NULL
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS financial_records (
    id TEXT PRIMARY KEY, amount REAL NOT NULL CHECK(amount > 0),
    type TEXT NOT NULL CHECK(type IN ('income','expense')),
    category TEXT NOT NULL, date TEXT NOT NULL, notes TEXT,
    created_by TEXT NOT NULL REFERENCES users(id),
    deleted_at TEXT DEFAULT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
  )`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_r_type ON financial_records(type)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_r_cat  ON financial_records(category)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_r_date ON financial_records(date)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_r_del  ON financial_records(deleted_at)`);
  persist();
}

function dbGet(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const row = stmt.step() ? stmt.getAsObject() : undefined;
  stmt.free();
  return row;
}

function dbAll(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

function dbRun(sql, params = []) {
  db.run(sql, params);
  persist();
  return { changes: 1 };
}

module.exports = { initSchema, dbGet, dbAll, dbRun };
