// src/pages/Eventscheduler/AllEventsList.js
import React, { useState } from "react";
import moment from "moment";
import "./AllEventsList.css";

const AllEventsList = ({ events, onEdit }) => {
  const [activeTab, setActiveTab] = useState("today");
  const now = moment();

  const todayEvents = events.filter((ev) =>
    moment(ev.start).isSame(now, "day")
  );

  const upcomingEvents = events.filter((ev) =>
    moment(ev.start).isAfter(now, "day")
  );

  const pastEvents = events.filter((ev) =>
    moment(ev.end).isBefore(now)
  );

  const getEventsByTab = () => {
    switch (activeTab) {
      case "today":
        return todayEvents;
      case "upcoming":
        return upcomingEvents;
      case "past":
        return pastEvents;
      default:
        return [];
    }
  };

  const list = getEventsByTab();

  return (
    <div className="all-events"id="root" data-theme="dark">
      <h3>All Events</h3>

      {/* Tabs */}
      <div className="events-tabs">
        <button
          className={activeTab === "today" ? "active" : ""}
          onClick={() => setActiveTab("today")}
        >
          Today ({todayEvents.length})
        </button>

        <button
          className={activeTab === "upcoming" ? "active" : ""}
          onClick={() => setActiveTab("upcoming")}
        >
          Upcoming ({upcomingEvents.length})
        </button>

        <button
          className={activeTab === "past" ? "active" : ""}
          onClick={() => setActiveTab("past")}
        >
          Past ({pastEvents.length})
        </button>
      </div>

      {/* Event Cards */}
      {list.length === 0 ? (
        <div className="empty-state">
          <p>No events here ✨</p>
        </div>
      ) : (
        <div className="events-grid">
          {list.map((event) => (
            <div
              key={event.id}
              className={`event-card ${activeTab === "past" ? "past" : ""}`}
              onClick={() => onEdit(event)}
            >
              <div
                className="color-strip"
                style={{ background: event.color }}
              />

              <div className="event-content">
                <h4>{event.title}</h4>
                <p>
                  {moment(event.start).format("DD MMM YYYY")} <br />
                  {moment(event.start).format("hh:mm A")} –{" "}
                  {moment(event.end).format("hh:mm A")}
                </p>
              </div>

              <div className="date-badge">
                <span>{moment(event.start).format("DD")}</span>
                <small>{moment(event.start).format("MMM")}</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllEventsList;
