const MindMap = require('../models/MindMap');

// @desc    Create new mind map
// @route   POST /api/mindmaps
// @access  Private
const createMindMap = async (req, res) => {
  try {
    console.log('Request received:', {
      method: req.method,
      url: req.url,
      userId: req.user.id,
      body: req.body
    });

    const { title, nodes, edges } = req.body;

    if (!title || !nodes || !edges) {
      return res.status(400).json({ 
        message: 'Title, nodes, and edges are required',
        received: { title: !!title, nodes: !!nodes, edges: !!edges }
      });
    }

    const mindMap = new MindMap({
      title,
      nodes,
      edges,
      user: req.user.id
    });

    await mindMap.save();
    console.log('Mind map created successfully:', mindMap._id);
    
    return res.status(201).json({ 
      message: 'Mind map saved successfully', 
      mindMap 
    });

  } catch (error) {
    console.error('Create MindMap Error:', error);
    
    return res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get all mind maps for logged-in user
// @route   GET /api/mindmaps
// @access  Private
const getUserMindMaps = async (req, res) => {
  try {
    console.log('Getting mind maps for user:', req.user.id);
    
    const maps = await MindMap.find({ user: req.user.id }).sort({ createdAt: -1 });
    
    console.log('Found mind maps:', maps.length);
    
    res.json(maps);
  } catch (error) {
    console.error('Get MindMaps Error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get single mind map by ID (must be owned by user)
// @route   GET /api/mindmaps/:id
// @access  Private
const getMindMapById = async (req, res) => {
  try {
    console.log('Getting mind map:', req.params.id, 'for user:', req.user.id);
    
    const map = await MindMap.findOne({ _id: req.params.id, user: req.user.id });
    
    if (!map) {
      console.log('Mind map not found or not authorized');
      return res.status(404).json({ message: 'Mind map not found' });
    }
    
    res.json(map);
  } catch (error) {
    console.error('Get MindMap Error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Update an existing mind map (must be owned by user)
// @route   PUT /api/mindmaps/:id
// @access  Private
const updateMindMap = async (req, res) => {
  try {
    console.log('Updating mind map:', req.params.id, 'for user:', req.user.id);
    
    const { title, nodes, edges } = req.body;
    const mindMap = await MindMap.findOne({ _id: req.params.id, user: req.user.id });

    if (!mindMap) {
      return res.status(404).json({ message: 'Mind map not found or not authorized' });
    }

    if (title) mindMap.title = title;
    if (nodes) mindMap.nodes = nodes;
    if (edges) mindMap.edges = edges;

    await mindMap.save();
    console.log('Mind map updated successfully');
    
    res.json({ message: 'Mind map updated successfully', mindMap });
  } catch (error) {
    console.error('Update MindMap Error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Delete a mind map (must be owned by user)
// @route   DELETE /api/mindmaps/:id
// @access  Private
const deleteMindMap = async (req, res) => {
  try {
    console.log('Deleting mind map:', req.params.id, 'for user:', req.user.id);
    
    const mindMap = await MindMap.findOne({ _id: req.params.id, user: req.user.id });

    if (!mindMap) {
      return res.status(404).json({ message: 'Mind map not found or not authorized' });
    }

    await mindMap.deleteOne();
    console.log('Mind map deleted successfully');
    
    res.json({ message: 'Mind map deleted successfully' });
  } catch (error) {
    console.error('Delete MindMap Error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  createMindMap,
  getUserMindMaps,
  getMindMapById,
  updateMindMap,
  deleteMindMap
};
