const express = require('express');
const router = express.Router();
const {
  createMindMap,
  getUserMindMaps,
  getMindMapById,
  updateMindMap,
  deleteMindMap
} = require('../controllers/mindMapController');

const authenticateToken = require('../middleware/authMiddleware');

// Create Mind Map
router.post('/', authenticateToken, createMindMap);

// Get user's Mind Maps
router.get('/', authenticateToken, getUserMindMaps);

// Get single Mind Map by ID
router.get('/:id', authenticateToken, getMindMapById);

// Update Mind Map
router.put('/:id', authenticateToken, updateMindMap);

// Delete Mind Map
router.delete('/:id', authenticateToken, deleteMindMap);

module.exports = router;
