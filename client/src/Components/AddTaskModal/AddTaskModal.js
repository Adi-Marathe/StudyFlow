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
    setFormData(prev => ({ ...prev, [name]: value }));
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
      const res = await fetch('http://localhost:5000/api/tasks/addtask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        id: backendTask._id || backendTask.id || Date.now(), // fallback if backend omits id
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
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <div className="modal-title-section">
            <div className="task-icon">
              <Plus size={20} />
            </div>
            <h2 className="modal-title">Add New Task</h2>
          </div>
          <button className="close-button" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter task title"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter task description (max 200 characters)"
              className="form-textarea"
              maxLength={200}
              rows={4}
            />
            <div className="char-counter">
              <span className={charCount > 180 ? 'char-warning' : ''}>
                {charCount}/200
              </span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <Tag size={16} /> Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
              {/* If your backend returns "Completed", you can still normalize it in normalizeStatusForBoard */}
            </select>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={handleClose}
              className="cancel-button"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              <Plus size={16} />
              {loading ? 'Adding...' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;
