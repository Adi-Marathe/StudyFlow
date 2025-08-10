import React, { useState, useEffect } from 'react';
import { X, Tag } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './EditTaskModal.css';

const EditTaskModal = ({ isOpen, onClose, task, onTaskUpdated, onTaskDeleted }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'To Do'
  });

  const [charCount, setCharCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: normalizeStatus(task.status || 'To Do')
      });
      setCharCount(task.description ? task.description.length : 0);
    }
  }, [task]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'description') setCharCount(value.length);
  };

  // Normalize to "To Do", "In Progress", "Done"
  const normalizeStatus = (status) => {
    const s = String(status || '').trim().toLowerCase();
    if (s === 'to do' || s === 'todo') return 'To Do';
    if (s === 'in progress' || s === 'progress') return 'In Progress';
    if (s === 'done' || s === 'completed') return 'Done';
    return 'To Do';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!task || !task.id) {
      toast.error('❌ Task ID is missing.');
      return;
    }
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        status: normalizeStatus(formData.status)
      };

      const res = await fetch(`http://localhost:5000/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update task');
      }

      // Map response back to consistent shape
      const serverTask = data.task || data;
      const mappedUpdated = {
        id: serverTask._id || serverTask.id || task.id,
        title: serverTask.title ?? payload.title,
        description: serverTask.description ?? serverTask.desc ?? payload.description ?? '',
        status: normalizeStatus(serverTask.status ?? payload.status)
      };

      onTaskUpdated?.(mappedUpdated);
      toast.success('Task updated successfully!');
      onClose();
    } catch (err) {
      toast.error(`${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!task || !task.id) {
      toast.error('Task ID is missing.');
      return;
    }

    const confirmed = window.confirm('Are you sure you want to delete this task?');
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${task.id}`, {
        method: 'DELETE'
      });

      // Some backends return 204 with no JSON; handle both cases safely
      let data = {};
      try {
        data = await res.json();
      } catch (_) {
        // ignore parse error on empty body
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete task');
      }

      // Notify parent/board to remove task immediately
      onTaskDeleted?.(task.id);

      toast.success('Task deleted');
      onClose();
    } catch (err) {
      toast.error(`${err.message}`);
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
          <h2 className="modal-title">Edit Task</h2>
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
            </select>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={handleDelete}
              className="delete-button"
              disabled={loading}
            >
              Delete
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;
