const Note = require('../models/Note');

/**
 * @desc    Create a new note for the logged-in user
 * @route   POST /api/notes
 * @access  Private
 */
const createNote = async (req, res, next) => {
  try {
    const {
      fileName,
      title,
      pages,
      fontSize,
      currentTextColor,
      currentHighlightColor,
      lastModified
    } = req.body;

    const note = await Note.create({
      userId: req.user.id,
      fileName: fileName || 'Untitled',
      title: title || '',
      pages: pages || [],
      fontSize: fontSize || 16,
      currentTextColor: currentTextColor || '#000000',
      currentHighlightColor: currentHighlightColor || '#ffff00',
      lastModified: lastModified ? new Date(lastModified) : new Date()
    });

    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all notes for the logged-in user
 * @route   GET /api/notes
 * @access  Private
 */
const getNotes = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, q, includeDeleted = 'false' } = req.query;
    const filter = { userId: req.user.id };
    if (includeDeleted !== 'true') filter.isDeleted = false;
    if (q) filter.$text = { $search: q };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [notes, total] = await Promise.all([
      Note.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(parseInt(limit)),
      Note.countDocuments(filter)
    ]);

    res.json({
      data: notes,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single note (only if owned by the user)
 * @route   GET /api/notes/:id
 * @access  Private
 */
const getNoteById = async (req, res, next) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user.id,
      isDeleted: false
    });

    if (!note) return res.status(404).json({ message: 'Note not found' });

    res.json(note);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing note
 * @route   PUT /api/notes/:id
 * @access  Private
 */
const updateNote = async (req, res, next) => {
  try {
    const updatedData = {
      ...req.body,
      lastModified: new Date()
    };

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updatedData,
      { new: true, runValidators: true }
    );

    if (!note) return res.status(404).json({ message: 'Note not found' });

    res.json(note);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Soft delete or hard delete a note
 * @route   DELETE /api/notes/:id
 * @access  Private
 */
const deleteNote = async (req, res, next) => {
  try {
    const { hard } = req.query;

    if (hard === 'true') {
      const deleted = await Note.findOneAndDelete({
        _id: req.params.id,
        userId: req.user.id
      });
      if (!deleted) return res.status(404).json({ message: 'Note not found' });
      return res.status(204).send();
    }

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isDeleted: true, lastModified: new Date() },
      { new: true }
    );

    if (!note) return res.status(404).json({ message: 'Note not found' });

    res.json({ message: 'Note soft deleted', note });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Restore a soft-deleted note
 * @route   POST /api/notes/:id/restore
 * @access  Private
 */
const restoreNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isDeleted: false, lastModified: new Date() },
      { new: true }
    );

    if (!note) return res.status(404).json({ message: 'Note not found' });

    res.json(note);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  restoreNote
};
