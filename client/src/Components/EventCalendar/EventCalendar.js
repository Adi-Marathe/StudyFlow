// src/Components/EventCalendar/EventCalendar.js
import React from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./EventCalendar.css";

const localizer = momentLocalizer(moment);

const EventCalendar = ({ events, onSelectEvent, onSelectSlot }) => {
  return (
    <Calendar
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      selectable
      style={{ height: "100%", minHeight: "500px" }}
      onSelectEvent={onSelectEvent}
      onSelectSlot={onSelectSlot}
      views={["month", "week", "day", "agenda"]}
      eventPropGetter={(event) => ({
        style: {
          backgroundColor: event.color || "#4d2c5e",
          color: "#fff",
          borderRadius: "6px",
          padding: "4px",
        }
      })}
    />
  );
};

export default EventCalendar;
