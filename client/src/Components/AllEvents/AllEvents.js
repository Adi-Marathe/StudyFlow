// src/Components/AllEvents/AllEvents.js
import React from "react";
import moment from "moment";
import "./AllEvents.css";

const AllEvents = ({ events }) => {
  const sortedEvents = [...events].sort((a, b) => new Date(a.start) - new Date(b.start));

  return (
    <div className="all-events-container">
      <h4>All Upcoming Events</h4>
      {sortedEvents.length === 0 ? (
        <p className="no-events">No events available.</p>
      ) : (
        <div className="all-events-list">
          {sortedEvents.map((event) => (
            <div className="all-event-card" key={event.id}>
              <div className="event-card-header" style={{ backgroundColor: event.color || "#4d2c5e" }}>
                {event.title}
              </div>
              <div className="event-card-body">
                <p><strong>Date:</strong> {moment(event.start).format("MMMM Do YYYY")}</p>
                <p><strong>Time:</strong> {moment(event.start).format("h:mm A")} - {moment(event.end).format("h:mm A")}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllEvents;
