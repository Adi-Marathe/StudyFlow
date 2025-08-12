const MindMap = require('../models/MindMap');

// @desc    Create new mind map
// @route   POST /api/mindmaps
// @access  Private
const createMindMap = async (req, res) => {
  try {
    const { title, nodes, edges } = req.body;

    if (!title || !nodes || !edges) {
      return res.status(400).json({ message: 'Title, nodes, and edges are required' });
    }

    const mindMap = new MindMap({
      title,
      nodes,
      edges,
      user: req.user.id
    });

    await mindMap.save();
    res.status(201).json({ message: 'Mind map saved successfully', mindMap });
  } catch (error) {
    console.error('Create MindMap Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all mind maps for logged-in user
// @route   GET /api/mindmaps
// @access  Private
const getUserMindMaps = async (req, res) => {
  try {
    const maps = await MindMap.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(maps);
  } catch (error) {
    console.error('Get MindMaps Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single mind map by ID (must be owned by user)
// @route   GET /api/mindmaps/:id
// @access  Private
const getMindMapById = async (req, res) => {
  try {
    const map = await MindMap.findOne({ _id: req.params.id, user: req.user.id });
    if (!map) {
      return res.status(404).json({ message: 'Mind map not found' });
    }
    res.json(map);
  } catch (error) {
    console.error('Get MindMap Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update an existing mind map (must be owned by user)
// @route   PUT /api/mindmaps/:id
// @access  Private
const updateMindMap = async (req, res) => {
  try {
    const { title, nodes, edges } = req.body;
    const mindMap = await MindMap.findOne({ _id: req.params.id, user: req.user.id });

    if (!mindMap) {
      return res.status(404).json({ message: 'Mind map not found or not authorized' });
    }

    if (title) mindMap.title = title;
    if (nodes) mindMap.nodes = nodes;
    if (edges) mindMap.edges = edges;

    await mindMap.save();
    res.json({ message: 'Mind map updated successfully', mindMap });
  } catch (error) {
    console.error('Update MindMap Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a mind map (must be owned by user)
// @route   DELETE /api/mindmaps/:id
// @access  Private
const deleteMindMap = async (req, res) => {
  try {
    const mindMap = await MindMap.findOne({ _id: req.params.id, user: req.user.id });

    if (!mindMap) {
      return res.status(404).json({ message: 'Mind map not found or not authorized' });
    }

    await mindMap.deleteOne();
    res.json({ message: 'Mind map deleted successfully' });
  } catch (error) {
    console.error('Delete MindMap Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createMindMap,
  getUserMindMaps,
  getMindMapById,
  updateMindMap,
  deleteMindMap
};
