import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Moon, Sun, LogOut, User } from 'lucide-react';
import axios from 'axios';
import './Navbar.css';
import { DarkModeContext } from '../../context/DarkModeContext';

const Navbar = ( ) => {
  const [userName, setUserName] = useState("Loading...")
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { isDarkMode, toggleDarkMode } = useContext(DarkModeContext);
  const location = useLocation();
  
  useEffect(() => {
    document.body.classList.toggle("dark-mode", isDarkMode);
  }, [isDarkMode]);

  const pageTitles = {
    "/dashboard": "Dashboard",
    "/taskmanager": "Task Manager",
    "/eventscheduler": "Event Scheduler",
    "/focusmode": "Focus Mode",
    "/pomodoro": "Pomodoro Timer",
    "/flashcards": "Flashcards",
    "/mindmaps": "Mind Maps",
    "/messages": "Messages",
    "/notes": "Notes",
    "/chatbot": "Chatbot",
  };

  const currentPath = location.pathname;
  const currentPage = pageTitles[currentPath] || "StudyFlow";

  useEffect(() => {
  const fetchUser = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUserName("Guest");
      return;
    }

    try {
      const response = await axios.get("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserName(response.data.name);
    } catch (error) {
      console.error("Error fetching user:", error);
      setUserName("Guest");
    }
  };

  fetchUser();
}, [localStorage.getItem("token")]);

  const getInitial = (name) => {
    return name.charAt(0).toUpperCase() ;
  };

  // const notifications = [
  //   { id: 1, message: "New assignment due tomorrow", time: "2 hours ago" },
  //   { id: 2, message: "Study group meeting at 3 PM", time: "4 hours ago" },
  //   { id: 3, message: "Quiz results are available", time: "1 day ago" }
  // ];

  return (
    <nav className="d-navbar">
      {/* Left side - Page title */}
      <div className="d-navbar-left">
        <h1 className="page-title">{currentPage}</h1>
      </div>

      {/* Right side - Actions and Profile */}
      <div className="d-navbar-right">

        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="navbar-icon-button"
        >
          {isDarkMode ? <Sun className="navbar-icon" /> : <Moon className="navbar-icon" />}
        </button>

        {/* Notifications */}
        <div className="notification-container">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="navbar-icon-button notification-btn"
          >
            <Bell className="navbar-icon" />
          </button>

          {/* Notifications dropdown
          {showNotifications && (
            <div className="dropdown notifications-dropdown">
              <div className="dropdown-header">
                <h3 className="dropdown-title">Notifications</h3>
              </div>
              <div className="notifications-list">
                {notifications.map((notification) => (
                  <div key={notification.id} className="notification-item">
                    <p className="notification-message">{notification.message}</p>
                    <p className="notification-time">{notification.time}</p>
                  </div>
                ))}
              </div>
              <div className="dropdown-footer">
                <button className="view-all-btn">
                  View all notifications
                </button>
              </div>
            </div>
          )} */}
        </div>

        {/* Profile */}
        <div className="profile-container">
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="profile-button"
          >
            {/* Profile photo with initial */}
            <div className="profile-photo">
              {getInitial(userName)}
            </div>
            {/* Always show name */}
            <div className="profile-info">
              <p className="profile-name">{userName}</p>
            </div>
          </button>

          {/* Profile dropdown
          {showProfileDropdown && (
            <div className="dropdown profile-dropdown">
              <div className="dropdown-header profile-header">
                <div className="profile-header-content">
                  <div className="profile-photo-large">
                    {getInitial(userName)}
                  </div>
                  <div className="profile-header-info">
                    <p className="profile-header-name">{userName}</p>
                    <p className="profile-header-role">Student</p>
                  </div>
                </div>
              </div>
              <div className="dropdown-menu">
                <button className="menu-item">
                  <User className="menu-icon" />
                  <span>Profile</span>
                </button>
              </div>
              <div className="dropdown-footer">
                <button className="menu-item logout-item">
                  <LogOut className="menu-icon" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )} */}
        </div>
      </div>

      {/* Overlay to close dropdowns when clicking outside */}
      {/* {(showProfileDropdown || showNotifications) && (
        <div
          className="overlay"
          onClick={() => {
            setShowProfileDropdown(false);
            setShowNotifications(false);
          }}
        />
      )} */}
    </nav>
  );
};

export default Navbar;
