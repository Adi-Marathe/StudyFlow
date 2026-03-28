import React from "react";
import moment from "moment";
import { CalendarDays, Clock } from "lucide-react";
import "./TodayEvents.css";

const TodayEvents = ({ events = [] }) => {
  const today = moment().startOf("day");
  const now = moment();

  const todaysEvents = events
    .filter((ev) => {
      if (!ev || !ev.start || !ev.end) return false;
      return moment(ev.start).isSame(today, "day");
    })
    .sort((a, b) => new Date(a.start) - new Date(b.start));

  const getStatus = (ev) => {
    if (now.isBefore(moment(ev.start))) return "upcoming";
    if (now.isAfter(moment(ev.end))) return "done";
    return "ongoing";
  };

  return (
    <div className="te-wrapper">
      {/* Header */}
      <div className="te-header">
        <div className="te-header-left">
          <CalendarDays size={16} className="te-header-icon" />
          <span className="te-title">Today's Events</span>
        </div>
        {todaysEvents.length > 0 && (
          <span className="te-badge">{todaysEvents.length}</span>
        )}
      </div>

      {/* Card */}
      <div className="te-card">
        {todaysEvents.length === 0 ? (
          <div className="te-empty">
            <CalendarDays size={28} className="te-empty-icon" />
            <span>No events today</span>
          </div>
        ) : (
          <div className="te-list">
            {todaysEvents.map((ev) => {
              const status = getStatus(ev);
              return (
                <div key={ev.id} className={`te-event te-event--${status}`}>
                  {/* Color bar */}
                  <span
                    className="te-bar"
                    style={{ backgroundColor: ev.color || "#ff7426" }}
                  />

                  {/* Content */}
                  <div className="te-content">
                    <div className="te-top">
                      <span className="te-name">{ev.title}</span>
                      {status === "ongoing" && (
                        <span className="te-pill te-pill--ongoing">Live</span>
                      )}
                      {status === "done" && (
                        <span className="te-pill te-pill--done">Done</span>
                      )}
                    </div>

                    <div className="te-time">
                      <Clock size={11} />
                      {moment(ev.start).format("hh:mm A")} –{" "}
                      {moment(ev.end).format("hh:mm A")}
                    </div>

                    {ev.location && (
                      <div className="te-location">📍 {ev.location}</div>
                    )}
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