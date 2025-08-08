import React, { useState } from 'react';
import Sidebar from '../../Components/Sidebar/Sidebar';
import Navbar from '../../Components/Navbar/Navbar';
import WelcomeBanner from '../../Components/WelcomeBanner/WelcomeBanner';
import TaskStatsCards from '../../Components/TaskStatsCards/TaskStatsCards';
import AddTaskModal from '../../Components/AddTaskModal/AddTaskModal'; // ✅ import your modal
import './Taskmanager.css';

function Taskmanager() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // This will handle task creation (connect this to your backend later)
  const handleSaveTask = (task) => {
    console.log("Task saved: ", task);
    // TODO: send task to backend
  };

  return (
    <div className='taskmanager-container'>
      <Sidebar />
      
      <div className="taskmanager-content-wrapper">
        <Navbar />
        <main className="taskmanager-main">
          <WelcomeBanner
            subtitle="Welcome To"
            title="Your Task Management Area"
            description="Stay organized and in control. Let’s conquer your goals one task at a time!"
            buttonText="+ Add Task"
            onButtonClick={() => setIsModalOpen(true)} // ✅ open modal
            animation="https://lottie.host/0faac7cd-d602-42ac-bdc4-0adc29ef53ea/vfOIsP34wi.lottie"
          />
          <TaskStatsCards />
        </main>
      </div>

      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
      />
    </div>
  );
}

export default Taskmanager;
