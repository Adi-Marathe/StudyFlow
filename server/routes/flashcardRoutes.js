const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  getAllSets,
  getSet,
  createSet,
  updateSet,
  deleteSet
} = require('../controllers/flashcardController');

router.use(auth); // protect all flashcard routes

router.get('/', getAllSets);
router.get('/:id', getSet);
router.post('/', createSet);
router.put('/:id', updateSet);
router.delete('/:id', deleteSet);

module.exports = router;
