import React, { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./EventCalendar.css";

const localizer = momentLocalizer(moment);

const EventCalendar = ({ events = [], onSelectEvent, onSelectSlot }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("month");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dayEvents, setDayEvents] = useState([]);
  const [dayLabel, setDayLabel] = useState("");

  // ✅ Normalize event dates to JS Date objects
  const normalizedEvents = events.map(ev => ({
    ...ev,
    start: new Date(ev.start),
    end: new Date(ev.end)
  }));

  const showDayDetails = (eventsForDate, date) => {
    setDayEvents(eventsForDate || []);
    setDayLabel(moment(date).format("ddd, MMM D, YYYY"));
    setDrawerOpen(true);
  };

  return (
    <div className="calendar-wrapper">
      <Calendar
        localizer={localizer}
        events={normalizedEvents}
        startAccessor="start"
        endAccessor="end"
        selectable
        date={currentDate}
        view={currentView}
        onView={(v) => setCurrentView(v)}
        onNavigate={(d) => setCurrentDate(d)}
        onSelectEvent={onSelectEvent}
        onSelectSlot={onSelectSlot}
        views={["month", "week", "day", "agenda"]}
        popup={false}
        onShowMore={(eventsForDate, date) => {
          setCurrentDate(date);
          setCurrentView("day");
          showDayDetails(eventsForDate, date);
        }}
        style={{ height: "100%", minHeight: "500px" }}
        eventPropGetter={(event) => ({
          style: {
            backgroundColor: event.color || "#4d2c5e",
            color: "#fff",
            borderRadius: "6px",
            padding: "4px",
          },
        })}
      />

      
    </div>
  );
};

export default EventCalendar;
