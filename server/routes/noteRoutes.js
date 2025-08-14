const express = require('express');
const router = express.Router();
const {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  restoreNote
} = require('../controllers/noteController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, createNote);
router.get('/', auth, getNotes);
router.get('/:id', auth, getNoteById);
router.put('/:id', auth, updateNote);
router.delete('/:id', auth, deleteNote);
router.post('/:id/restore', auth, restoreNote);

module.exports = router;
