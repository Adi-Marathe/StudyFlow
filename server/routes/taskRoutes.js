const express = require('express');
const router = express.Router();
const { createTask, getAllTasks, updateTask, deleteTask } = require('../controllers/taskController');
const auth = require('../middleware/authMiddleware'); // Your auth middleware

// Create task
router.post('/addtask', auth, createTask);

// Get all tasks
router.get('/all', auth, getAllTasks);

// Update a task
router.put('/:id', auth, updateTask);

// Delete a task
router.delete('/:id', auth, deleteTask);

module.exports = router;
