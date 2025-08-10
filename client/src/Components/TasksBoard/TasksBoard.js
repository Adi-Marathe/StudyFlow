import React, { useEffect, useState } from 'react';
import './TasksBoard.css';
import EditTaskModal from '../EditTaskModal/EditTaskModal';
import confetti from 'canvas-confetti';

const TasksBoard = ({ newTask, onCountsChange }) => {
  const [tasks, setTasks] = useState({ todo: [], inprogress: [], done: [] });
  const [draggedTask, setDraggedTask] = useState(null);
  const [draggedFrom, setDraggedFrom] = useState(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Celebration: “pop pearls” style
  const fireConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      startVelocity: 45,
      gravity: 0.9,
      ticks: 200,
      origin: { y: 0.7 },
      scalar: 0.8,
      shapes: ['circle']
    });
    setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 55,
        startVelocity: 35,
        gravity: 0.9,
        origin: { y: 0.75 },
        scalar: 0.6,
        shapes: ['circle']
      });
    }, 150);
  };

  // Normalize to display labels used across the app
  const normalizeStatus = (status) => {
    const s = String(status || '').trim().toLowerCase();
    if (s === 'to do' || s === 'todo') return 'To Do';
    if (s === 'in progress' || s === 'progress') return 'In Progress';
    if (s === 'completed' || s === 'done') return 'Done';
    return 'To Do';
  };

  const mapTask = (raw) => ({
    id: raw._id || raw.id,
    title: raw.title,
    description: raw.description ?? raw.desc ?? '',
    status: normalizeStatus(raw.status)
  });

  // Column id -> display status
  const columnIdToStatus = {
    todo: 'To Do',
    inprogress: 'In Progress',
    done: 'Done'
  };

  // Fetch once on mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/tasks/all');
        const data = await res.json();

        const grouped = { todo: [], inprogress: [], done: [] };
        data.forEach((raw) => {
          const t = mapTask(raw);
          if (!t.id) return; // defensive
          if (t.status === 'To Do') grouped.todo.push(t);
          else if (t.status === 'In Progress') grouped.inprogress.push(t);
          else if (t.status === 'Done') grouped.done.push(t);
        });

        setTasks(grouped);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, []);

  // Emit counts to parent whenever board tasks change
  useEffect(() => {
    const counts = {
      total: tasks.todo.length + tasks.inprogress.length + tasks.done.length,
      todo: tasks.todo.length,
      inProgress: tasks.inprogress.length,
      done: tasks.done.length
    };
    if (typeof onCountsChange === 'function') {
      onCountsChange(counts);
    }
  }, [tasks, onCountsChange]);

  // If parent passes a freshly created task, append it instantly
  useEffect(() => {
    if (!newTask) return;
    const t = mapTask(newTask);
    if (!t.id) return;

    setTasks((prev) => {
      // prevent duplicates if same task pushed again
      const exists =
        prev.todo.some(x => x.id === t.id) ||
        prev.inprogress.some(x => x.id === t.id) ||
        prev.done.some(x => x.id === t.id);
      if (exists) return prev;

      const updated = { ...prev };
      if (t.status === 'To Do') updated.todo = [...updated.todo, t];
      else if (t.status === 'In Progress') updated.inprogress = [...updated.inprogress, t];
      else if (t.status === 'Done') updated.done = [...updated.done, t];
      return updated;
    });
  }, [newTask]);

  // Upsert task in correct column (after edit/server response)
  const upsertTask = (taskLike) => {
    const t = mapTask(taskLike);
    if (!t.id) return;
    setTasks((prev) => {
      const updated = {
        todo: prev.todo.filter((x) => x.id !== t.id),
        inprogress: prev.inprogress.filter((x) => x.id !== t.id),
        done: prev.done.filter((x) => x.id !== t.id)
      };
      if (t.status === 'To Do') updated.todo = [...updated.todo, t];
      else if (t.status === 'In Progress') updated.inprogress = [...updated.inprogress, t];
      else if (t.status === 'Done') updated.done = [...updated.done, t];
      return updated;
    });
  };

  // Drag & Drop
  const handleDragStart = (e, task, columnId) => {
    setDraggedTask(task);
    setDraggedFrom(columnId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetColumnId) => {
    e.preventDefault();
    if (!draggedTask || !draggedFrom || draggedFrom === targetColumnId) {
      setDraggedTask(null);
      setDraggedFrom(null);
      return;
    }

    const newStatus = columnIdToStatus[targetColumnId] || 'To Do';
    const moved = { ...draggedTask, status: newStatus };

    // Snapshot for rollback
    const snapshot = JSON.parse(JSON.stringify(tasks));

    // Optimistic UI update
    setTasks((prev) => {
      const updated = { ...prev };
      updated[draggedFrom] = updated[draggedFrom].filter((t) => t.id !== draggedTask.id);
      updated[targetColumnId] = [...updated[targetColumnId], moved];
      return updated;
    });

    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${draggedTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      let data = {};
      try { data = await res.json(); } catch (_) {}

      if (!res.ok) {
        throw new Error(data.error || `Failed to update status (HTTP ${res.status})`);
      }

      const serverTask = data.task || data;
      if (serverTask && (serverTask._id || serverTask.id)) {
        upsertTask(serverTask);
      }

      // Celebrate completion
      if (newStatus === 'Done') {
        fireConfetti();
      }
    } catch (err) {
      console.error('Drag status update failed:', err);
      // Rollback UI
      setTasks(snapshot);
    } finally {
      setDraggedTask(null);
      setDraggedFrom(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDraggedFrom(null);
  };

  // Edit
  const handleEditClick = (taskId) => {
    const taskObj =
      tasks.todo.find((t) => t.id === taskId) ||
      tasks.inprogress.find((t) => t.id === taskId) ||
      tasks.done.find((t) => t.id === taskId);

    if (taskObj) {
      setSelectedTask(taskObj);
      setIsEditOpen(true);
    }
  };

  const handleTaskUpdated = (updatedTask) => {
    upsertTask(updatedTask);
    setIsEditOpen(false);
  };

  const handleTaskDeleted = (id) => {
    setTasks(prev => ({
      todo: prev.todo.filter(t => t.id !== id),
      inprogress: prev.inprogress.filter(t => t.id !== id),
      done: prev.done.filter(t => t.id !== id),
    }));
  };

  const columns = [
    { id: 'todo', title: 'To do', color: '#8B5CF6' },
    { id: 'inprogress', title: 'In progress', color: '#F59E0B' },
    { id: 'done', title: 'Done', color: '#6EE7B7' }
  ];

  return (
    <div className="tasks-board">
      <div className="board-header">
        <h2>Your Tasks</h2>
      </div>

      <div className="board-columns">
        {columns.map((column) => (
          <div
            key={column.id}
            className="column"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="column-header">
              <div className="column-title-wrapper">
                <div
                  className="column-indicator"
                  style={{ backgroundColor: column.color }}
                />
                <h3 className="column-title">{column.title}</h3>
                <span className="task-count">{tasks[column.id].length}</span>
              </div>
              <button className="column-menu">⋯</button>
            </div>

            <div className="tasks-container">
              {tasks[column.id].length === 0 ? (
                <div className="empty-state">
                  <span className="empty-text">No tasks</span>
                </div>
              ) : (
                tasks[column.id].map((task) => (
                  <div
                    key={task.id}
                    className={`task-card ${draggedTask?.id === task.id ? 'dragging' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task, column.id)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="task-header">
                      <h4 className="task-title">{task.title}</h4>
                      <button
                        className="task-menu"
                        onClick={() => handleEditClick(task.id)}
                      >
                        ⋯
                      </button>
                    </div>
                    <p className="task-desc">{task.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      <EditTaskModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        task={selectedTask}
        onTaskUpdated={handleTaskUpdated}
        onTaskDeleted={handleTaskDeleted}
      />
    </div>
  );
};

export default TasksBoard;
