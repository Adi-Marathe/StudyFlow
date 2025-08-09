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
  
  // Centralized task state management
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Hero section",
      description: "Create a hero section for homepage.",
      status: "todo",
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      title: "Typography change", 
      description: "Update and document typography.",
      status: "todo",
      createdAt: new Date().toISOString()
    },
    {
      id: 3,
      title: "Implement design screens",
      description: "Dev team to implement screens.",
      status: "progress",
      createdAt: new Date().toISOString()
    },
    {
      id: 4,
      title: "Responsive design",
      description: "Ensure designs are responsive.",
      status: "done",
      createdAt: new Date().toISOString()
    }
  ]);

  // Handle task creation from modal
  const handleSaveTask = (taskData) => {
    const newTask = {
      id: Date.now(), // Simple ID generation (use proper UUID in production)
      title: taskData.title,
      description: taskData.description,
      status: "todo", // New tasks start in "To Do"
      createdAt: new Date().toISOString(),
      ...taskData // Include any additional fields from the modal
    };
    
    setTasks(prevTasks => [...prevTasks, newTask]);
    setIsModalOpen(false);
    
    console.log("Task saved: ", newTask);
    // TODO: send task to backend
  };

  // Handle task status updates from drag & drop
  const handleTaskUpdate = (taskId, updates) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, ...updates }
          : task
      )
    );
    // TODO: update task in backend
  };

  // Delete task
  const handleDeleteTask = (taskId) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    // TODO: delete task from backend
  };

  // Calculate stats for TaskStatsCards
  const taskStats = {
    total: tasks.length,
    todo: tasks.filter(task => task.status === 'todo').length,
    inProgress: tasks.filter(task => task.status === 'progress').length,
    done: tasks.filter(task => task.status === 'done').length
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
            description="Stay organized and in control. Let's conquer your goals one task at a time!"
            buttonText="+ Add Task"
            onButtonClick={() => setIsModalOpen(true)}
            animation="https://lottie.host/0faac7cd-d602-42ac-bdc4-0adc29ef53ea/vfOIsP34wi.lottie"
          />
          <TaskStatsCards stats={taskStats} />
          <TasksBoard 
            tasks={tasks}
            onTaskUpdate={handleTaskUpdate}
            onTaskDelete={handleDeleteTask}
          />
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