import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UpcomingActivities.css';

const UpcomingActivities = ({ maxEvents = 4 }) => {
  const [activities, setActivities] = useState([]);

  // Color schemes for different events
  const colorSchemes = [
    { bgColor: '#e3f2fd', dateColor: '#1976d2' },
    { bgColor: '#fce4ec', dateColor: '#e91e63' },
    { bgColor: '#e8f5e8', dateColor: '#4caf50' },
    { bgColor: '#fff3e0', dateColor: '#ff9800' },
    { bgColor: '#f3e5f5', dateColor: '#9c27b0' },
    { bgColor: '#e0f2f1', dateColor: '#00796b' },
    { bgColor: '#fff8e1', dateColor: '#f57c00' },
    { bgColor: '#fce4ec', dateColor: '#c2185b' }
  ];

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const fetchUpcomingEvents = () => {
    try {
      const storedEvents = localStorage.getItem("events");
      if (storedEvents) {
        const events = JSON.parse(storedEvents);
        
        // Filter for upcoming events (future events only)
        const now = new Date();
        const upcomingEvents = events
          .filter(event => new Date(event.start) > now)
          .sort((a, b) => new Date(a.start) - new Date(b.start))
          .slice(0, maxEvents);

        // Transform events to activities format
        const transformedActivities = upcomingEvents.map((event, index) => {
          const startDate = new Date(event.start);
          const endDate = new Date(event.end);
          const colorScheme = colorSchemes[index % colorSchemes.length];

          return {
            id: event.id,
            date: startDate.getDate(),
            title: event.title,
            dateRange: formatDateRange(startDate, endDate),
            time: formatTimeRange(startDate, endDate),
            location: event.location || event.description || 'No location specified',
            bgColor: colorScheme.bgColor,
            dateColor: colorScheme.dateColor,
            originalEvent: event
          };
        });

        setActivities(transformedActivities);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setActivities([]);
    }
  };

  const formatDateRange = (start, end) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const startStr = start.toLocaleDateString('en-US', options);
    
    // If same day, show only start date
    if (start.toDateString() === end.toDateString()) {
      return startStr;
    }
    
    // If different days, show range
    const endStr = end.toLocaleDateString('en-US', options);
    return `${startStr} - ${endStr}`;
  };

  const formatTimeRange = (start, end) => {
    const formatTime = (date) => {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    };

    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  // Refresh events when component receives focus (optional)
  useEffect(() => {
    const handleFocus = () => {
      fetchUpcomingEvents();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const navigate = useNavigate();
  
    const handleClick = () => {
      navigate('/eventscheduler');
    };

  return (
    <div className="upcoming-activities">
      <div className="activities-header">
        <h2 className="activities-title">Upcoming Activities</h2>
        <button className="see-all-btn" onClick={fetchUpcomingEvents}>
          See all
        </button>
      </div>
      
      <div className="activities-list" onClick={handleClick}>
        {activities.length > 0 ? (
          activities.map((activity) => (
            <div 
              key={activity.id} 
              className="activity-item"
              style={{ backgroundColor: activity.bgColor }}
              onClick={() => handleActivityClick(activity)}
            >
              <div className="activity-content">
                <div 
                  className="activity-date"
                  style={{ backgroundColor: activity.dateColor }}
                >
                  <span className="date-number">{activity.date}</span>
                </div>
                
                <div className="activity-details">
                  <h3 className="activity-title">{activity.title}</h3>
                  <div className="activity-meta">
                    <span className="activity-date-range">{activity.dateRange}</span>
                    <span className="activity-time-separator">●</span>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                  <p className="activity-location">{activity.location}</p>
                </div>
                
                <div className="activity-arrow">
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  >
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </div>
              </div>
              
              <div className="activity-side-accent" style={{ backgroundColor: activity.dateColor }}></div>
            </div>
          ))
        ) : (
          <div className="no-activities">
            <div className="no-activities-icon">📅</div>
            <h3>No Upcoming Activities</h3>
            <p>You're all caught up! Add new events to see them here.</p>
          </div>
        )}
      </div>
    </div>
  );

  // Handle activity click (optional - you can customize this)
  function handleActivityClick(activity) {
    console.log('Activity clicked:', activity.originalEvent);
    // You can add navigation or modal opening logic here
    // For example, navigate to event details or open edit modal
  }
};

export default UpcomingActivities;