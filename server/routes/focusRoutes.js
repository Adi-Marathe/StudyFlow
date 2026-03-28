const express             = require('express');
const router              = express.Router();
const authenticateToken   = require('../middleware/authMiddleware');
const {
  startSession,
  completeSession,
  abandonSession,
  getStats,
  getWeeklyData,
  getProductivityTrend,
  getHistory,
} = require('../controllers/focusController');

// All routes are protected
router.use(authenticateToken);

// ── Session lifecycle ──────────────────────────────
router.post('/',                      startSession);        // POST   /api/focus
router.patch('/:id/complete',         completeSession);     // PATCH  /api/focus/:id/complete
router.patch('/:id/abandon',          abandonSession);      // PATCH  /api/focus/:id/abandon

// ── Dashboard data ─────────────────────────────────
router.get('/stats',                  getStats);            // GET    /api/focus/stats
router.get('/weekly',                 getWeeklyData);       // GET    /api/focus/weekly
router.get('/productivity-trend',     getProductivityTrend);// GET    /api/focus/productivity-trend
router.get('/history',                getHistory);          // GET    /api/focus/history

module.exports = router;