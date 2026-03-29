import React, { useState, useEffect } from 'react';
import './TaskSelectModal.css';

function TaskSelectModal({ isOpen, onClose, onStart }) {
  const [tasks, setTasks]             = useState([]);
  const [selected, setSelected]       = useState(null);
  const [focusIntent, setFocusIntent] = useState('');
  const [loading, setLoading]         = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res   = await fetch('https://studyflow-xh1t.onrender.com/api/tasks/all', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const active = data.filter(t => {
          const s = (t.status || '').toLowerCase();
          return s !== 'completed' && s !== 'done';
        });
        setTasks(active);
      } catch (e) {
        console.error('Failed to fetch tasks:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
    setSelected(null);
    setFocusIntent('');
  }, [isOpen]);

  if (!isOpen) return null;

  const getTaskId = (task) => task?._id || task?.id || null;

  const handleStart = () => {
    onStart({
      focusIntent: focusIntent.trim() || selected?.title || '',
      taskId: getTaskId(selected),
      taskTitle: selected?.title || null,
    });
    onClose();
  };

  return (
    <div className="tsm-backdrop" onClick={onClose}>
      <div className="tsm-modal" onClick={e => e.stopPropagation()}>
        <div className="tsm-header">
          <div className="tsm-header-dot" />
          <h2 className="tsm-title">Start Focus Session</h2>
          <button className="tsm-close" onClick={onClose}>✕</button>
        </div>

        <div className="tsm-field">
          <label className="tsm-label">WHAT ARE YOU FOCUSING ON?</label>
          <input
            className="tsm-input"
            placeholder="e.g. Study Chapter 5, Design the dashboard..."
            value={focusIntent}
            onChange={e => setFocusIntent(e.target.value)}
            autoFocus
          />
        </div>

        <div className="tsm-field">
          <label className="tsm-label">LINK A TASK (OPTIONAL)</label>
          {loading ? (
            <div className="tsm-loading">
              <span className="tsm-spinner" />
              Loading tasks...
            </div>
          ) : tasks.length === 0 ? (
            <p className="tsm-empty">No active tasks found.</p>
          ) : (
            <div className="tsm-task-list">
              {tasks.map(task => {
                const id       = getTaskId(task);
                const isActive = getTaskId(selected) === id;
                return (
                  <button
                    key={id}
                    className={`tsm-task-item ${isActive ? 'tsm-task-item--active' : ''}`}
                    onClick={() => setSelected(prev => getTaskId(prev) === id ? null : task)}
                  >
                    <span className="tsm-task-check">{isActive ? '✓' : '○'}</span>
                    <div className="tsm-task-info">
                      <span className="tsm-task-title">{task.title}</span>
                      {task.description && (
                        <span className="tsm-task-desc">{task.description}</span>
                      )}
                    </div>
                    <span className={`tsm-task-status tsm-task-status--${(task.status || '').toLowerCase().replace(/\s/g, '')}`}>
                      {task.status}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {selected && (
          <div className="tsm-selected-banner">
            🎯 Linked: <strong>{selected.title}</strong>
          </div>
        )}

        <div className="tsm-actions">
          <button className="tsm-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="tsm-btn-start" onClick={handleStart}>
            <span className="tsm-btn-dot" />
            Start Focus
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskSelectModal;