import React, { useState, useEffect } from 'react';
import './EventList.css';

const EventList = ({ events }) => {
  const [todayEvents, setTodayEvents] = useState([]);

  useEffect(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

    const filtered = events.filter((event) => {
      const eventDate = new Date(event.start).toISOString().split('T')[0];
      return eventDate === todayStr;
    });

    setTodayEvents(filtered);
  }, [events]);

  return (
    <div className="event-list-container">
      <h3>📅 Today’s Events</h3>

      {todayEvents.length === 0 ? (
        <p className="no-events">No events scheduled for today.</p>
      ) : (
        <div className="event-list horizontal-scroll">
          {todayEvents.map((event) => (
            <div className="event-item full-width" key={event.id}>
              <div className="event-title">{event.title}</div>
              <div className="event-time">
                {new Date(event.start).toLocaleString()} -{' '}
                {new Date(event.end).toLocaleString()}
              </div>
              {event.description && (
                <div className="event-description">{event.description}</div>
              )}
              <div
                className="event-color"
                style={{ backgroundColor: event.color || '#4d2c5e' }}
              ></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventList;
