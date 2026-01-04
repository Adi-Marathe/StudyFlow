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
      user: req.user.id, // Get from auth middleware
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
    const tasks = await Task.find({ user: req.user.id }); // Filter by user
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an existing task by ID
exports.updateTask = async (req, res) => {
  try {
    // Find task and verify ownership
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if task belongs to user
    if (task.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this task' });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // return the updated task
    );

    res.json({ message: 'Task updated successfully', task: updatedTask });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/tasks/:id
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    // Find task and verify ownership
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if task belongs to user
    if (task.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this task' });
    }

    await Task.findByIdAndDelete(id);
    return res.status(200).json({ success: true, id });
  } catch (err) {
    console.error('Delete task error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
