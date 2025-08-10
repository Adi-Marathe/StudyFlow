const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true, maxlength: 200 },
    status: { type: String, enum: ['To Do', 'In Progress', 'Done'], default: 'To Do' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', TaskSchema);
