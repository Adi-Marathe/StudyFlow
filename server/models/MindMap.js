const mongoose = require('mongoose');

const mindMapSchema = new mongoose.Schema({
  title: { type: String, required: true },
  nodes: { type: Array, required: true },  // array of React Flow node objects
  edges: { type: Array, required: true },  // array of React Flow edge objects
  user: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true 
  }, // logged-in user
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MindMap', mindMapSchema);
