# FinanceDash — Full Stack Finance Dashboard

A full-stack finance dashboard with role-based access control.
**Backend**: Node.js + Express + sql.js (SQLite) | **Frontend**: React + Vite + Recharts

---

## Quick Start (3 commands)

```bash
# 1. Install all dependencies (root + backend + frontend)
npm run install:all

# 2. Seed the database with demo users + 60 records
npm run seed

# 3. Start both servers concurrently
npm run dev
```

| Service  | URL                       |
|----------|---------------------------|
| Frontend | http://localhost:5173     |
| Backend  | http://localhost:4000/api |

---

## Demo Accounts

| Role    | Email               | Password     | Access |
|---------|---------------------|--------------|--------|
| Admin   | admin@demo.com      | admin123     | Full — read, write, analytics, user management |
| Analyst | analyst@demo.com    | analyst123   | Read records + full analytics |
| Viewer  | viewer@demo.com     | viewer123    | Read records + recent activity only |

Use the **Quick Login** buttons on the login page to switch roles instantly.

---

## Project Structure

```
financeapp/
├── package.json              ← root: runs both servers
├── backend/
│   ├── package.json
│   └── src/
│       ├── app.js            ← Express entry + CORS
│       ├── models/db.js      ← sql.js database (no native compilation)
│       ├── middleware/       ← JWT auth + role guards + validation
│       ├── controllers/      ← auth, users, records, dashboard
│       ├── routes/index.js   ← all API routes
│       └── utils/seed.js     ← demo data seeder
└── frontend/
    ├── vite.config.js        ← Vite + /api proxy to backend
    └── src/
        ├── App.jsx           ← routing + auth guards
        ├── api/client.js     ← all fetch calls
        ├── hooks/useAuth.jsx ← auth context
        ├── components/
        │   ├── UI.jsx        ← Btn, Input, Modal, Toast, StatCard...
        │   └── Layout.jsx    ← sidebar + nav
        └── pages/
            ├── Login.jsx     ← login + quick-switch
            ├── Dashboard.jsx ← stats + charts + recent activity
            ├── Records.jsx   ← CRUD table with filters + pagination
            └── Users.jsx     ← user management (admin only)
```

---

## API Endpoints

### Auth
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | /api/auth/login | Public | Get JWT token |
| POST | /api/auth/register | Admin | Create user |

### Records
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | /api/records | All | List (filter + paginate) |
| GET | /api/records/:id | All | Get single record |
| POST | /api/records | Admin | Create |
| PATCH | /api/records/:id | Admin | Update |
| DELETE | /api/records/:id | Admin | Soft delete |

### Dashboard
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | /api/dashboard/recent | All | Last 10 transactions |
| GET | /api/dashboard/summary | Analyst+ | Totals + category breakdown |
| GET | /api/dashboard/trends | Analyst+ | Monthly income vs expenses |

### Users
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | /api/users | Admin | List users |
| GET | /api/users/:id | Admin | Get user |
| PATCH | /api/users/:id | Admin | Update role/status |
| DELETE | /api/users/:id | Admin | Delete user |

---

## Why sql.js?

`sql.js` is a pure WebAssembly build of SQLite — no C++ compilation, no `node-gyp`, no Python. Works on any Node version including v25, arm64 Macs, Windows, Linux. The DB is loaded into memory on startup and persisted to `backend/data/finance.db` after every write.

---

## Role Permission Matrix

| Action | Viewer | Analyst | Admin |
|--------|:------:|:-------:|:-----:|
| View records | ✓ | ✓ | ✓ |
| Recent activity | ✓ | ✓ | ✓ |
| Analytics / trends | ✗ | ✓ | ✓ |
| Create / edit / delete records | ✗ | ✗ | ✓ |
| Manage users | ✗ | ✗ | ✓ |
