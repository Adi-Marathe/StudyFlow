import React, { useState } from 'react';
import Sidebar from '../../Components/Sidebar/Sidebar';
import Navbar from '../../Components/Navbar/Navbar';
import WelcomeBanner from '../../Components/WelcomeBanner/WelcomeBanner';
import TaskStatsCards from '../../Components/TaskStatsCards/TaskStatsCards';
import AddTaskModal from '../../Components/AddTaskModal/AddTaskModal';
import TasksBoard from '../../Components/TasksBoard/TasksBoard';
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

  // Receive counts from TasksBoard whenever its internal tasks change
  const handleCountsChange = (counts) => {
    setStats(counts);
  };

  return (
    <div className="taskmanager-container">
      <Sidebar />

      <div className="taskmanager-content-wrapper">
        <Navbar />
        <main className="taskmanager-main">
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

          {/* Board fetches tasks, emits counts up, and appends lastAddedTask instantly */}
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
