const bcrypt = require('bcryptjs');
const { v4: uuid } = require('uuid');
const { initSchema, dbGet, dbRun } = require('../models/db');
const now = () => new Date().toISOString().replace('T',' ').slice(0,19);

async function seed() {
  await initSchema();
  const n = now();
  const users = [
    { name:'Alice Admin',   email:'admin@demo.com',   role:'admin',   pw:'admin123' },
    { name:'Ana Analyst',   email:'analyst@demo.com', role:'analyst', pw:'analyst123' },
    { name:'Victor Viewer', email:'viewer@demo.com',  role:'viewer',  pw:'viewer123' },
  ];
  for (const u of users) {
    if (!dbGet('SELECT id FROM users WHERE email=?',[u.email])) {
      dbRun('INSERT INTO users(id,name,email,password,role,created_at,updated_at) VALUES(?,?,?,?,?,?,?)',
        [uuid(), u.name, u.email, bcrypt.hashSync(u.pw,10), u.role, n, n]);
    }
    console.log(`✓ ${u.email} / ${u.pw} [${u.role}]`);
  }
  const adminId = dbGet('SELECT id FROM users WHERE email=?',['admin@demo.com']).id;
  const cats = {
    income:  [['Salary',4500],['Freelance',2000],['Investment',1500],['Bonus',3000]],
    expense: [['Rent',900],['Utilities',250],['Groceries',400],['Travel',700],['Software',350],['Marketing',1100]],
  };
  let count=0;
  for (let m=1; m<=6; m++) {
    const mo = String(m).padStart(2,'0');
    for (const [type, entries] of Object.entries(cats)) {
      for (const [cat, base] of entries) {
        const amount = +(base + Math.random()*base*0.4 - base*0.2).toFixed(2);
        const day    = String(Math.floor(Math.random()*28)+1).padStart(2,'0');
        dbRun('INSERT INTO financial_records(id,amount,type,category,date,notes,created_by,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)',
          [uuid(), amount, type, cat, `2025-${mo}-${day}`, `${cat} · month ${m}`, adminId, n, n]);
        count++;
      }
    }
  }
  console.log(`\n✓ ${count} records seeded (Jan–Jun 2025)\n`);
  process.exit(0);
}
seed().catch(e=>{ console.error(e); process.exit(1); });
