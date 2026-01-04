import React, { useState } from 'react';
import { X, Plus, Tag } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AddTaskModal.css';

const AddTaskModal = ({ isOpen, onClose, onTaskAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'To Do'
  });
  const [charCount, setCharCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (name === 'description') setCharCount(value.length);
  };

  const normalizeStatusForBoard = (status) => {
    const s = String(status || '').trim().toLowerCase();
    if (s === 'to do' || s === 'todo') return 'To Do';
    if (s === 'in progress' || s === 'progress') return 'In Progress';
    if (s === 'completed' || s === 'done') return 'Done';
    return 'To Do';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    setLoading(true);

    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please login to add tasks');
        return;
      }

      const res = await fetch('http://localhost:5000/api/tasks/addtask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Add auth token
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add task');
      }

      // Support either { task: {...} } or plain task response
      const backendTask = data.task || data;

      // Map to a consistent shape for your app
      const mappedTask = {
        id: backendTask._id || backendTask.id || Date.now(),
        title: backendTask.title ?? formData.title,
        description: backendTask.description ?? backendTask.desc ?? formData.description ?? '',
        status: normalizeStatusForBoard(backendTask.status ?? formData.status)
      };

      // Send to parent so it can insert into the board immediately
      onTaskAdded?.(mappedTask);
      toast.success('Task added successfully!');

      // Reset and close
      setFormData({ title: '', description: '', status: 'To Do' });
      setCharCount(0);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ title: '', description: '', status: 'To Do' });
    setCharCount(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <Plus size={24} />
            Add New Task
          </h2>
          <button className="close-btn" onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Task Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter task title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter task description"
              maxLength={200}
              required
            />
            <span className="char-count">{charCount}/200</span>
          </div>

          <div className="form-group">
            <label htmlFor="status">
              <Tag size={18} />
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Adding...' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;
