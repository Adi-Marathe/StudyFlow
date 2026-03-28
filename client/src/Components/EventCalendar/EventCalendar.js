import React from "react";
import moment from "moment";
import { Calendar, momentLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "./EventCalendar.css";

const localizer = momentLocalizer(moment);
const DragAndDropCalendar = withDragAndDrop(Calendar);

const eventStyleGetter = (event) => ({
  style: {
    backgroundColor: event.color || "#ff7426",
    borderRadius: "8px",
    color: "#fff",
    border: "none",
  },
});

const EventCalendar = ({ events, onSelectSlot, onSelectEvent, onEventDrop }) => {
  return (
    <div className="sf-calendar-wrapper">
      <DragAndDropCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable
        onSelectSlot={({ start, end }) => onSelectSlot(start, end)}
        onSelectEvent={onSelectEvent}
        onEventDrop={onEventDrop}
        resizable
        eventPropGetter={eventStyleGetter}
        style={{ height: "100%" }}
      />
    </div>
  );
};

export default EventCalendar;