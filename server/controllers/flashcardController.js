const FlashcardSet = require('../models/flashmodel'); // make sure file name matches exactly

// ✅ Get all flashcard sets
const getAllSets = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized: No user ID found' });
    }

    const sets = await FlashcardSet.find({ user: req.user.id }).sort({ createdAt: -1 });
    console.log("Fetched sets:", JSON.stringify(sets, null, 2));
    return res.json(Array.isArray(sets) ? sets : []);
  } catch (err) {
    console.error("Error in getAllSets:", err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// ✅ Get a single flashcard set
const getSet = async (req, res) => {
  try {
    const set = await FlashcardSet.findById(req.params.id);
    if (!set || set.user.toString() !== req.user.id) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(set);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ✅ Create a new flashcard set
const createSet = async (req, res) => {
  try {
    console.log("Incoming body:", req.body);
    console.log("User ID from token:", req.user.id);

    const { title, description, cards } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const newSet = await FlashcardSet.create({
      user: req.user.id,
      title,
      description,
      cards: Array.isArray(cards) ? cards : []
    });

    res.status(201).json(newSet);
  } catch (err) {
    console.error("Error in createSet:", err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// ✅ Update flashcard set
const updateSet = async (req, res) => {
  try {
    const { title, description, cards } = req.body;
    const set = await FlashcardSet.findById(req.params.id);

    if (!set || set.user.toString() !== req.user.id) {
      return res.status(404).json({ error: 'Not found or access denied' });
    }

    set.title = title ?? set.title;
    set.description = description ?? set.description;
    set.cards = Array.isArray(cards) ? cards : set.cards;

    await set.save();
    res.json(set);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ✅ Delete flashcard set
const deleteSet = async (req, res) => {
  try {
    const set = await FlashcardSet.findById(req.params.id);
    if (!set || set.user.toString() !== req.user.id) {
      return res.status(404).json({ error: 'Not found or access denied' });
    }

    await set.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getAllSets, getSet, createSet, updateSet, deleteSet };
