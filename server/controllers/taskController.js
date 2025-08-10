const Task = require('../models/Task');

// Create Task Controller
exports.createTask = async (req, res) => {
  try {
    const { title, description, status } = req.body;

    // Validation
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const newTask = new Task({
      title,
      description,
      status: status || 'To Do'
    });

    await newTask.save();
    res.status(201).json({ message: 'Task created successfully', task: newTask });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all tasks controller
exports.getAllTasks = async (req, res) => {
    try {
      const tasks = await Task.find(); // Fetch all tasks from DB
      res.status(200).json(tasks);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};

// Update an existing task by ID
exports.updateTask = async (req, res) => {
    try {
      const updatedTask = await Task.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true } // return the updated task
      );
  
      if (!updatedTask) {
        return res.status(404).json({ error: 'Task not found' });
      }
  
      res.json({ message: 'Task updated successfully', task: updatedTask });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};

// DELETE /api/tasks/:id
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate id format if using Mongo
    // if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });

    const deleted = await Task.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Task not found' });
    }
    // Option A: 204 No Content
    // return res.status(204).send();

    // Option B: 200 OK with payload
    return res.status(200).json({ success: true, id });
  } catch (err) {
    console.error('Delete task error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};