const express = require('express');
const router = express.Router();
const { createTask, getAllTasks, updateTask, deleteTask } = require('../controllers/taskController');

// Create task
router.post('/addtask', createTask);

// Get all tasks
router.get('/all', getAllTasks);

// New route for updating a task
router.put('/:id', updateTask);

router.delete('/:id', deleteTask);

module.exports = router;
