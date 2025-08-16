const express = require('express');
const router = express.Router();
const {
  createPreset,
  getPresets,
  deletePreset
} = require('../controllers/timerController');

// POST /api/timers
router.post('/', createPreset);

// GET /api/timers
router.get('/', getPresets);

// DELETE /api/timers/:id
router.delete('/:id', deletePreset);

module.exports = router;
