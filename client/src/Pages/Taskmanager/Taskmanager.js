import React, { useState, useCallback } from 'react';
import Sidebar from '../../Components/Sidebar/Sidebar';
import Navbar from '../../Components/Navbar/Navbar';
import WelcomeBanner from '../../Components/WelcomeBanner/WelcomeBanner';
import TaskStatsCards from '../../Components/TaskStatsCards/TaskStatsCards';
import AddTaskModal from '../../Components/AddTaskModal/AddTaskModal';
import TasksBoard from '../../Components/TasksBoard/TasksBoard';
import TaskPercentage from '../../Components/TaskPercentage/TaskPercentage';
import './Taskmanager.css';

function Taskmanager() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Keep the last created task so we can push it to TasksBoard instantly
  const [lastAddedTask, setLastAddedTask] = useState(null);

  // Live stats reported by TasksBoard
  const [stats, setStats] = useState({
    total: 0,
    todo: 0,
    inProgress: 0,
    done: 0
  });

  // Called by AddTaskModal on successful creation
  const handleTaskAdded = (taskData) => {
    // taskData is already normalized by AddTaskModal (id, title, description, status)
    setLastAddedTask(taskData); // TasksBoard will append it immediately
    setIsModalOpen(false);
  };

  // 🔥 FIX: Wrap with useCallback to prevent infinite re-renders
  const handleCountsChange = useCallback((counts) => {
    setStats(counts);
  }, []); // Empty dependency array since setStats is stable

  return (
    <div className="taskmanager-container">
      <Sidebar />

      <div className="taskmanager-content-wrapper">
        <Navbar />
        <main className="taskmanager-main">
         <div className='overview'>
          <div className='left-overview'>
          <WelcomeBanner
            subtitle="Welcome To"
            title="Your Task Management Area"
            description="Stay organized and in control. Let's conquer your goals one task at a time!"
            buttonText="+ Add Task"
            onButtonClick={() => setIsModalOpen(true)}
            animation="https://lottie.host/0faac7cd-d602-42ac-bdc4-0adc29ef53ea/vfOIsP34wi.lottie"
          />

          {/* Live stats from the board */}
          <TaskStatsCards stats={stats} />
          </div>
          <TaskPercentage stats={stats} />
          </div>
            <TasksBoard
              newTask={lastAddedTask}
              onCountsChange={handleCountsChange}
            />
            
          
        </main>
      </div>

      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTaskAdded={handleTaskAdded}
      />
    </div>
  );
}

export default Taskmanager;
