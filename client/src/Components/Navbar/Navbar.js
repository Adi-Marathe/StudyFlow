import React, { useState, useEffect, useContext, useRef, useLayoutEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { Bell, Moon, Sun, LogOut, User, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Navbar.css';
import { DarkModeContext } from '../../context/DarkModeContext';

// Portal component for dropdowns
const DropdownPortal = ({ open, anchorRef, children, offset = 8 }) => {
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const updatePosition = () => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + offset,
      left: rect.right,
    });
  };

  useLayoutEffect(() => {
    if (open) {
      updatePosition();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleUpdate = () => updatePosition();
    window.addEventListener("resize", handleUpdate);
    window.addEventListener("scroll", handleUpdate, true);

    return () => {
      window.removeEventListener("resize", handleUpdate);
      window.removeEventListener("scroll", handleUpdate, true);
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: `${pos.top}px`,
        left: `${pos.left}px`,
        transform: "translateX(-100%)",
        zIndex: 1000,
      }}
    >
      {children}
    </div>,
    document.body
  );
};

// Edit Profile Modal Component
const EditProfileModal = ({ isOpen, onClose, userName, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Student',
    bio: ''
  });
  const [loading, setLoading] = useState(false);

  // Fetch user data when modal opens
  useEffect(() => {
    const fetchUserData = async () => {
      if (isOpen) {
        setLoading(true);
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get("http://localhost:5000/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          setFormData({
            name: response.data.name || '',
            email: response.data.email || '',
            role: response.data.role || 'Student',
            bio: response.data.bio || ''
          });
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast.error('Failed to load profile data');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put("http://localhost:5000/api/auth/profile", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onSave(formData.name);
      toast.success('Profile updated successfully!');
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      <div className="np-modal-overlay" onClick={onClose} />
      <div className="np-modal-container">
        <div className="np-modal-content">
          <div className="np-modal-header">
            <div className="np-modal-title-wrapper">
              <div className="np-modal-icon">
                <User size={20} />
              </div>
              <h2 className="np-modal-title">Edit Profile</h2>
            </div>
            <button className="np-modal-close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="np-modal-body">
              <div className="np-form-group">
                <label className="np-form-label">Name</label>
                <input
                  type="text"
                  name="name"
                  className="np-form-input"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="np-form-group">
                <label className="np-form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="np-form-input"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="np-form-group">
                <label className="np-form-label">Role</label>
                <select
                  name="role"
                  className="np-form-input"
                  value={formData.role}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="Student">Student</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Professional">Professional</option>
                </select>
              </div>

              <div className="np-form-group">
                <label className="np-form-label">Bio</label>
                <textarea
                  name="bio"
                  className="np-form-textarea"
                  placeholder="Tell us about yourself (max 150 characters)"
                  value={formData.bio}
                  onChange={handleChange}
                  maxLength={150}
                  rows={3}
                  disabled={loading}
                />
                <div className="np-character-count">{formData.bio.length}/150</div>
              </div>
            </div>

            <div className="np-modal-footer">
              <button type="button" className="np-btn-cancel" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="np-btn-primary" disabled={loading}>
                <User size={16} />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>,
    document.body
  );
};

const Navbar = () => {
  const [userName, setUserName] = useState("Loading...");
  const [userRole, setUserRole] = useState("Student");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const { isDarkMode, toggleDarkMode } = useContext(DarkModeContext);
  const location = useLocation();
  const navigate = useNavigate();
  
  const profileBtnRef = useRef(null);
  const notificationBtnRef = useRef(null);
  
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
        setUserRole("Student");
        return;
      }

      try {
        const response = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserName(response.data.name);
        setUserRole(response.data.role || "Student");
      } catch (error) {
        console.error("Error fetching user:", error);
        setUserName("Guest");
        setUserRole("Student");
      }
    };

    fetchUser();
  }, []);

  const getInitial = (name) => {
    return name.charAt(0).toUpperCase();
  };

  const handleEditProfile = () => {
    setShowProfileDropdown(false);
    setShowEditModal(true);
  };

  const handleSaveProfile = (newName) => {
    setUserName(newName);
    // Optionally refetch user data to update role as well
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserRole(response.data.role || "Student");
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.info('Logged out successfully!');
    navigate('/');
  };

  return (
    <>
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
              ref={notificationBtnRef}
              onClick={() => setShowNotifications(!showNotifications)}
              className="navbar-icon-button notification-btn"
            >
              <Bell className="navbar-icon" />
            </button>

            <DropdownPortal open={showNotifications} anchorRef={notificationBtnRef}>
              <div className="dropdown notifications-dropdown">
                <div className="dropdown-header">
                  <h3 className="dropdown-title">Notifications</h3>
                </div>
                <div className="notifications-list">
                  {/* Add notifications here */}
                </div>
                <div className="dropdown-footer">
                  <button className="view-all-btn">
                    View all notifications
                  </button>
                </div>
              </div>
            </DropdownPortal>
          </div>

          {/* Profile */}
          <div className="profile-container">
            <button
              ref={profileBtnRef}
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

            <DropdownPortal open={showProfileDropdown} anchorRef={profileBtnRef}>
              <div className="dropdown profile-dropdown">
                <div className="profile-dropdown-header">
                  <div className="profile-avatar-large">
                    {getInitial(userName)}
                  </div>
                  <div className="profile-details">
                    <h3 className="profile-dropdown-name">{userName}</h3>
                    <p className="profile-dropdown-role">{userRole}</p>
                    <span className="profile-status">
                      <span className="status-dot"></span>
                      Active now
                    </span>
                  </div>
                </div>
                
                <div className="profile-dropdown-divider"></div>
                
                <div className="profile-dropdown-actions">
                  <button className="profile-action-btn edit-profile-btn" onClick={handleEditProfile}>
                    <User className="action-icon" />
                    <span>Edit Profile</span>
                  </button>
                  
                  <button className="profile-action-btn logout-btn" onClick={handleLogout}>
                    <LogOut className="action-icon" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </DropdownPortal>
          </div>
        </div>

        {/* Overlay to close dropdowns when clicking outside */}
        {(showProfileDropdown || showNotifications) && (
          <div
            className="overlay"
            onClick={() => {
              setShowProfileDropdown(false);
              setShowNotifications(false);
            }}
          />
        )}
      </nav>

      {/* Edit Profile Modal */}
      <EditProfileModal 
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        userName={userName}
        onSave={handleSaveProfile}
      />
    </>
  );
};

export default Navbar;
