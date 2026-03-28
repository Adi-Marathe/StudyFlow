import React, { useState } from "react";
import moment from "moment";
import { Clock, MapPin, CalendarDays, Pencil } from "lucide-react";
import "./AllEventsList.css";

const TABS = [
  { key: "upcoming", label: "Upcoming" },
  { key: "today",    label: "Today"    },
  { key: "past",     label: "Past"     },
];

const AllEventsList = ({ events = [], onEdit }) => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const now = moment();

  const counts = {
    today:    events.filter((ev) => moment(ev.start).isSame(now, "day")).length,
    upcoming: events.filter((ev) => moment(ev.start).isAfter(now, "day")).length,
    past:     events.filter((ev) => moment(ev.end).isBefore(now)).length,
  };

  const filtered = events
    .filter((ev) => {
      if (activeTab === "today")    return moment(ev.start).isSame(now, "day");
      if (activeTab === "upcoming") return moment(ev.start).isAfter(now, "day");
      if (activeTab === "past")     return moment(ev.end).isBefore(now);
      return false;
    })
    .sort((a, b) =>
      activeTab === "past"
        ? new Date(b.start) - new Date(a.start) // newest first for past
        : new Date(a.start) - new Date(b.start) // soonest first for rest
    );

  /* Determine if an ongoing event is live (only relevant for today tab) */
  const isLive = (ev) =>
    now.isAfter(moment(ev.start)) && now.isBefore(moment(ev.end));

  return (
    <div className="ael-wrapper">

      {/* ── HEADER ── */}
      <div className="ael-header">
        <div className="ael-header-left">
          <h3 className="ael-title">All Events</h3>
        </div>
        <span className="ael-total">{events.length} total</span>
      </div>

      {/* ── INNER CARD ── */}
      <div className="ael-card-section">

      {/* ── TABS ── */}
      <div className="ael-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`ael-tab ${activeTab === tab.key ? "ael-tab--active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            <span className={`ael-tab-count ${activeTab === tab.key ? "ael-tab-count--active" : ""}`}>
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* ── GRID ── */}
      {filtered.length === 0 ? (
        <div className="ael-empty">
          <CalendarDays size={36} className="ael-empty-icon" />
          <p>No {activeTab} events</p>
        </div>
      ) : (
        <div className="ael-grid">
          {filtered.map((ev) => {
            const live = activeTab === "today" && isLive(ev);
            const isPast = activeTab === "past";
            const isSameDay = moment(ev.start).isSame(moment(ev.end), "day");

            return (
              <div
                key={ev.id}
                className={`ael-card ${isPast ? "ael-card--past" : ""} ${live ? "ael-card--live" : ""}`}
                onClick={() => onEdit(ev)}
              >
                {/* Top color bar */}
                <div
                  className="ael-card-bar"
                  style={{ backgroundColor: ev.color || "#ff7426" }}
                />

                {/* Card body */}
                <div className="ael-card-body">

                  {/* Date badge + live pill */}
                  <div className="ael-card-top">
                    <div className="ael-date-badge">
                      <span className="ael-date-day">
                        {moment(ev.start).format("DD")}
                      </span>
                      <span className="ael-date-mon">
                        {moment(ev.start).format("MMM")}
                      </span>
                    </div>

                    <div className="ael-card-pills">
                      {live && <span className="ael-pill ael-pill--live">● Live</span>}
                      {isPast && <span className="ael-pill ael-pill--past">Done</span>}
                      <button
                        className="ael-edit-btn"
                        onClick={(e) => { e.stopPropagation(); onEdit(ev); }}
                        title="Edit event"
                      >
                        <Pencil size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h4 className="ael-card-title">{ev.title}</h4>

                  {/* Description */}
                  {ev.description && (
                    <p className="ael-card-desc">{ev.description}</p>
                  )}

                  {/* Time */}
                  <div className="ael-card-meta">
                    <Clock size={12} />
                    <span>
                      {isSameDay
                        ? `${moment(ev.start).format("hh:mm A")} – ${moment(ev.end).format("hh:mm A")}`
                        : `${moment(ev.start).format("DD MMM, hh:mm A")} – ${moment(ev.end).format("DD MMM, hh:mm A")}`
                      }
                    </span>
                  </div>

                  {/* Location */}
                  {ev.location && (
                    <div className="ael-card-meta ael-card-meta--location">
                      <MapPin size={12} />
                      <span>{ev.location}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div> {/* end ael-card-section */}
    </div>
  );
};

export default AllEventsList;