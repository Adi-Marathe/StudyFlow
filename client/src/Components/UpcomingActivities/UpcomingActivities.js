import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UpcomingActivities.css';

const API_URL = 'http://localhost:5000/api/events/upcoming';

const UpcomingActivities = ({ maxEvents = 4 }) => {
  const [activities, setActivities] = useState([]);

  // Color schemes for fallback (when event has no color)
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

  const fetchUpcomingEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const now = new Date();
      const upcomingEvents = res.data
        .filter(event => new Date(event.start) > now)
        .sort((a, b) => new Date(a.start) - new Date(b.start))
        .slice(0, maxEvents);

      const transformedActivities = upcomingEvents.map((event, index) => {
        const startDate = new Date(event.start);
        const endDate   = new Date(event.end);

        // Use event's own saved color; fall back to color scheme
        const fallback   = colorSchemes[index % colorSchemes.length];
        const dateColor  = event.color || fallback.dateColor;

        // Derive a light bg tint from the event color
        const bgColor    = event.color
          ? hexToLightBg(event.color)
          : fallback.bgColor;

        return {
          id:           event._id || event.id,
          date:         startDate.getDate(),
          title:        event.title,
          dateRange:    formatDateRange(startDate, endDate),
          time:         formatTimeRange(startDate, endDate),
          location:     event.location || event.description || 'No location specified',
          bgColor,
          dateColor,
          originalEvent: event
        };
      });

      setActivities(transformedActivities);
    } catch (error) {
      console.error('Error fetching events:', error);
      setActivities([]);
    }
  };

  // Convert hex color → very light tinted background
  const hexToLightBg = (hex) => {
    try {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.12)`;
    } catch {
      return '#f3e5f5';
    }
  };

  const formatDateRange = (start, end) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const startStr = start.toLocaleDateString('en-US', options);
    if (start.toDateString() === end.toDateString()) return startStr;
    return `${startStr} - ${end.toLocaleDateString('en-US', options)}`;
  };

  const formatTimeRange = (start, end) => {
    const formatTime = (date) =>
      date.toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit', hour12: true
      });
    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  // Refresh on window focus
  useEffect(() => {
    window.addEventListener('focus', fetchUpcomingEvents);
    return () => window.removeEventListener('focus', fetchUpcomingEvents);
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
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </div>
              </div>

              <div
                className="activity-side-accent"
                style={{ backgroundColor: activity.dateColor }}
              />
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

  function handleActivityClick(activity) {
    navigate('/eventscheduler');
  }
};

export default UpcomingActivities;