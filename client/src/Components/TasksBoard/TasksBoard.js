import React, { useState } from 'react';
import './TasksBoard.css';

const TasksBoard = () => {
  const [tasks, setTasks] = useState({
    todo: [
      {
        id: '1',
        title: 'Hero section',
        desc: 'Create a design system for a hero section to 3 different screens. Create a design system for a hero section.'
      },
      {
        id: '2',
        title: 'Typography change',
        desc: 'Modify typography and styling that looks better than the current design. Prepare a documentation.'
      }
    ],
    inprogress: [
      {
        id: '3',
        title: 'Implement design screens',
        desc: 'Our designers created 8 screens for 6 websites that needs to be implemented by Monday.'
      }
    ],
    done: [
      {
        id: '4',
        title: 'Fix bugs in the CSS code',
        desc: 'Fix small bugs that are essential to improve for the new release that will happen this Monday.'
      },
      {
        id: '5',
        title: 'Proofread final test',
        desc: 'The final proofreading reviewing document before it gets published. Make sure that it follows our brand guidelines.'
      },
      {
        id: '6',
        title: 'Responsive design',
        desc: 'All designs need to be responsive. The layout needs to work flawlessly on web and mobile layouts.'
      }
    ]
  });

  const [draggedTask, setDraggedTask] = useState(null);
  const [draggedFrom, setDraggedFrom] = useState(null);

  const handleDragStart = (e, task, columnId) => {
    setDraggedTask(task);
    setDraggedFrom(columnId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetColumnId) => {
    e.preventDefault();
    
    if (!draggedTask || !draggedFrom || draggedFrom === targetColumnId) {
      setDraggedTask(null);
      setDraggedFrom(null);
      return;
    }

    setTasks(prevTasks => {
      const newTasks = { ...prevTasks };
      
      // Remove from source column
      newTasks[draggedFrom] = newTasks[draggedFrom].filter(
        task => task.id !== draggedTask.id
      );
      
      // Add to target column
      newTasks[targetColumnId] = [...newTasks[targetColumnId], draggedTask];
      
      return newTasks;
    });

    setDraggedTask(null);
    setDraggedFrom(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDraggedFrom(null);
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
        {columns.map(column => (
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
                ></div>
                <h3 className="column-title">{column.title}</h3>
                <span className="task-count">{tasks[column.id].length}</span>
              </div>
              <button className="column-menu">⋯</button>
            </div>
            
            <div className="tasks-container">
              {tasks[column.id].map(task => (
                <div
                  key={task.id}
                  className={`task-card ${draggedTask?.id === task.id ? 'dragging' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task, column.id)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="task-header">
                    <h4 className="task-title">{task.title}</h4>
                    <button className="task-menu">⋯</button>
                  </div>
                  <p className="task-desc">{task.desc}</p>
                  
                  <div className="task-footer">
                    <div className="task-avatars">
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TasksBoard;