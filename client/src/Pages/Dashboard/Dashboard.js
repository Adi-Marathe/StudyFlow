import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Sidebar from '../../Components/Sidebar/Sidebar';
import './Dashboard.css';
import Navbar from '../../Components/Navbar/Navbar';
import HomeHeader from '../../Components/HomeHeader/HomeHeader';
import Calendar from '../../Components/Calendar/Calendar';
import DTaskPercentage from '../../Components/DTaskPercentage/DTaskPercentage';
import ChatbotPreview from '../../Components/ChatbotPreview/ChatbotPreview';
import FocusModePreview from '../../Components/FocusModePreview/FocusModePreview';
import MessagesPreview from '../../Components/MessagesPreview/MessagesPreview';
import YourTools from '../../Components/YourTools/YourTools';
import UpcomingActivities from '../../Components/UpcomingActivities/UpcomindActivities';


function Dashboard(){
  const [stats, setStats] = useState({
    total: 0,
    todo: 0,
    inProgress: 0,
    done: 0
  });

  const [userData, setUserData] = useState(null);


  // Normalize status to match your TasksBoard logic
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


  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setUserData(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error('Failed to load profile data');
      }
    };

    fetchUserData();
  }, []);


  // Fetch task stats
  useEffect(() => {
    const fetchTaskStats = async () => {
      try {
        // Using the same endpoint as your TasksBoard
        const res = await fetch('http://localhost:5000/api/tasks/all');
        const data = await res.json();


        // Process tasks the same way as TasksBoard
        const grouped = { todo: [], inprogress: [], done: [] };
        data.forEach((raw) => {
          const t = mapTask(raw);
          if (!t.id) return; // defensive
          if (t.status === 'To Do') grouped.todo.push(t);
          else if (t.status === 'In Progress') grouped.inprogress.push(t);
          else if (t.status === 'Done') grouped.done.push(t);
        });


        // Calculate stats for DTaskPercentage component
        const counts = {
          total: grouped.todo.length + grouped.inprogress.length + grouped.done.length,
          todo: grouped.todo.length,
          inProgress: grouped.inprogress.length,
          done: grouped.done.length
        };


        setStats(counts);
      } catch (error) {
        console.error('Error fetching task stats:', error);
      }
    };


    // Fetch immediately on component mount
    fetchTaskStats();


    // Set up polling for live updates every 10 seconds
    // (You can adjust this interval based on your needs)
    const intervalId = setInterval(fetchTaskStats, 10000);


    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);


  return (
    <div className='dashboard-container'>
      <Sidebar />


      <div className="dashboard-content-wrapper">
        <Navbar />
        <div className="dashboard-main">
          <div className='d-left-container'>
            <HomeHeader
              subtitle="Welcome Back"
              title={`${userData?.name || 'User'} 👋`}
              description="Stay in flow and trust the process, because every focused moment of study is building the success you're striving for"
              animation="https://lottie.host/92250bd2-6426-426d-aa5c-bedb865f53aa/brFNCc52yW.lottie"
            />
            <div className='left-c-container'>
                <div className='l-left-c-container'>
                    <ChatbotPreview />
                    <FocusModePreview />
                    <MessagesPreview />
                </div>
                <div className='r-left-c-container'>
                    <DTaskPercentage stats={stats}/>
                    <YourTools/>
                </div>
            </div>
          </div>


          <div className='d-right-container'>
            <Calendar/>
            <UpcomingActivities />
          </div>    
        </div>
      </div>
    </div>
  );
}


export default Dashboard;
