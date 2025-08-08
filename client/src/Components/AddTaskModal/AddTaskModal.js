import React, { useState } from 'react';
import { X, Plus, Tag } from 'lucide-react';
import './AddTaskModal.css';

const AddTaskModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'To Do'
  });

  const [charCount, setCharCount] = useState(0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'description') {
      setCharCount(value.length);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    // Reset form
    setFormData({
      title: '',
      description: '',
      status: 'To Do'
    });
    setCharCount(0);
    onClose();
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      status: 'To Do'
    });
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
              <span className={charCount > 180 ? 'char-warning' : ''}>{charCount}/200</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <Tag size={16} />
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" onClick={handleClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="submit-button">
              <Plus size={16} />
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;