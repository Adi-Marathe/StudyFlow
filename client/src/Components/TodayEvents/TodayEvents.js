// src/pages/Eventscheduler/TodayEvents.js
import React from "react";
import moment from "moment";
import "./TodayEvents.css";

const TodayEvents = ({ events = [] }) => {
  const today = moment().startOf("day");
  const now = moment();

  // Filter only today's valid events
  const todaysEvents = events.filter((ev) => {
    if (!ev || !ev.start || !ev.end) return false;
    return moment(ev.start).isSame(today, "day");
  });

  return (
    <div className="today-events-wrapper">
      {/* 🔹 Title OUTSIDE the card */}
      <h3 className="today-events-title">Today’s Events</h3>

      {/* 🔹 Card */}
      <div className="today-events-card">
        {todaysEvents.length === 0 ? (
          <div className="no-events">No events today</div>
        ) : (
          <div className="today-events-list">
            {todaysEvents.map((ev) => {
              const isOngoing =
                now.isAfter(moment(ev.start)) &&
                now.isBefore(moment(ev.end));

              return (
                <div
                  key={ev.id}
                  className={`today-event-box ${
                    isOngoing ? "ongoing" : ""
                  }`}
                >
                  <span
                    className="event-dot"
                    style={{ backgroundColor: ev.color || "#ff7426" }}
                  />

                  <div className="event-info">
                    <span className="event-name">{ev.title}</span>
                    <span className="event-time">
                      {moment(ev.start).format("hh:mm A")} –{" "}
                      {moment(ev.end).format("hh:mm A")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TodayEvents;
