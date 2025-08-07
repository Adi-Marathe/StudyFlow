import React, { useState } from 'react';
import { 
  Home, 
  BotMessageSquare, 
  Clock, 
  CheckSquare, 
  Calendar, 
  Timer, 
  BookOpen,
  Focus,  
  CreditCard, 
  Brain, 
  StickyNote, 
  MessageCircle, 
  LogOut,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import logo from '../../Assets/images/StudyFlow-logo.png'
import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const [isTimeToolsOpen, setIsTimeToolsOpen] = useState(true);
  const [isLearningToolsOpen, setIsLearningToolsOpen] = useState(true);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.info('Logged out successfully!');
    navigate('/');
  };

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">
            <img
                alt="StudyFlow"
                src={logo}
                height="49"
            />
          </div>
          <span className="logo-text">Study<span className='flow'>Flow</span></span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {/* Home */}
        <NavLink to='/dashboard' className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <Home size={20} />
          <span>Home</span>
        </NavLink>

        {/* AI Chatbot */}
        <NavLink to='/chatbot' className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <BotMessageSquare size={20} />
          <span>AI Chatbot</span>
        </NavLink>

        {/* Time Management Tools */}
        <div className="nav-category">
          <div 
            className="category-header"
            onClick={() => setIsTimeToolsOpen(!isTimeToolsOpen)}
          >
            <div className="category-title">
              <Clock size={20} />
              <span>Time manager</span>
            </div>
            {isTimeToolsOpen ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </div>
          
          {isTimeToolsOpen && (
            <div className="category-items">
              <NavLink to='/taskmanager' className={({ isActive }) => isActive ? 'sub-nav-item active' : 'sub-nav-item'}>
                <CheckSquare size={16} />
                <span>Task manager</span>
              </NavLink>
              <NavLink to='/eventscheduler' className={({ isActive }) => isActive ? 'sub-nav-item active' : 'sub-nav-item'}>
                <Calendar size={16} />
                <span>Event Scheduler</span>
              </NavLink>
              <NavLink to='/pomodoro' className={({ isActive }) => isActive ? 'sub-nav-item active' : 'sub-nav-item'}>
                <Timer size={16} />
                <span>Pomodoro Timer</span>
              </NavLink>
              <NavLink to='/focusmode' className={({ isActive }) => isActive ? 'sub-nav-item active' : 'sub-nav-item'}>
                <Focus size={16} />
                <span>Focus Mode</span>
              </NavLink>
            </div>
          )}
        </div>

        {/* Learning Tools */}
        <div className="nav-category">
          <div 
            className="category-header"
            onClick={() => setIsLearningToolsOpen(!isLearningToolsOpen)}
          >
            <div className="category-title">
              <BookOpen size={20} />
              <span>Learning tools</span>
            </div>
            {isLearningToolsOpen ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </div>
          
          {isLearningToolsOpen && (
            <div className="category-items">
              <NavLink to='/flashcards' className={({ isActive }) => isActive ? 'sub-nav-item active' : 'sub-nav-item'}>
                <CreditCard size={16} />
                <span>Flashcards</span>
              </NavLink>
              <NavLink to='/mindmaps' className={({ isActive }) => isActive ? 'sub-nav-item active' : 'sub-nav-item'}>
                <Brain size={16} />
                <span>Mind Maps</span>
              </NavLink>
              <NavLink to='/notes' className={({ isActive }) => isActive ? 'sub-nav-item active' : 'sub-nav-item'}>
                <StickyNote size={16} />
                <span>Notes</span>
              </NavLink>
            </div>
          )}
        </div>

        {/* Messages - Fixed structure */}
        <NavLink to='/messages' className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <MessageCircle size={20} />
          <span>Messages</span>
        </NavLink>
      </nav>

      {/* Sign Out */}
      <div className="sidebar-footer">
        <button class="Btn" onClick={handleLogout}>
          <div class="sign"><svg viewBox="0 0 512 512"><path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path></svg></div>
          <div class="text">Logout</div>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;