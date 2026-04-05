const router   = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const auth   = require('../controllers/authController');
const users  = require('../controllers/userController');
const recs   = require('../controllers/recordController');
const dash   = require('../controllers/dashboardController');

const ROLES  = ['viewer','analyst','admin'];
const TYPES  = ['income','expense'];
const STATUS = ['active','inactive'];

// ── Auth ──────────────────────────────────────────────────────────────────────
router.post('/auth/login',
  body('email').isEmail(), body('password').notEmpty(), validate, auth.login);

router.post('/auth/register',
  authenticate, authorize('admin'),
  body('name').trim().notEmpty(), body('email').isEmail(),
  body('password').isLength({min:6}),
  body('role').optional().isIn(ROLES), validate, auth.register);

// ── Users (admin only) ────────────────────────────────────────────────────────
router.get('/users',     authenticate, authorize('admin'), users.listUsers);
router.get('/users/:id', authenticate, authorize('admin'), users.getUser);
router.patch('/users/:id',
  authenticate, authorize('admin'),
  body('role').optional().isIn(ROLES),
  body('status').optional().isIn(STATUS),
  validate, users.updateUser);
router.delete('/users/:id', authenticate, authorize('admin'), users.deleteUser);

// ── Records ───────────────────────────────────────────────────────────────────
router.get('/records',     authenticate, recs.listRecords);
router.get('/records/:id', authenticate, recs.getRecord);
router.post('/records',
  authenticate, authorize('admin'),
  body('amount').isFloat({gt:0}), body('type').isIn(TYPES),
  body('category').trim().notEmpty(), body('date').isISO8601(),
  validate, recs.createRecord);
router.patch('/records/:id',
  authenticate, authorize('admin'),
  body('amount').optional().isFloat({gt:0}),
  body('type').optional().isIn(TYPES),
  body('date').optional().isISO8601(),
  validate, recs.updateRecord);
router.delete('/records/:id', authenticate, authorize('admin'), recs.deleteRecord);

// ── Dashboard ─────────────────────────────────────────────────────────────────
router.get('/dashboard/recent',  authenticate, dash.getRecent);
router.get('/dashboard/summary', authenticate, authorize('analyst','admin'), dash.getSummary);
router.get('/dashboard/trends',  authenticate, authorize('analyst','admin'), dash.getTrends);

// ── Health ────────────────────────────────────────────────────────────────────
router.get('/health', (_,res) => res.json({ status:'ok', ts: new Date().toISOString() }));

module.exports = router;
