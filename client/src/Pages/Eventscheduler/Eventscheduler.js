import React, { useState, useEffect } from "react";
import moment from "moment";
import { Calendar, momentLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import axios from "axios";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

import Sidebar from "../../Components/Sidebar/Sidebar";
import Navbar from "../../Components/Navbar/Navbar";
import WelcomeBanner from "../../Components/WelcomeBanner/WelcomeBanner";
import TodayEvents from "../../Components/TodayEvents/TodayEvents";
import AllEventsList from "../../Components/AllEventsList/AllEventsList";
import EventModal from "../../Components/EventModal/EventModal";

import "./Eventscheduler.css";

const localizer = momentLocalizer(moment);
const DragAndDropCalendar = withDragAndDrop(Calendar);

const Eventscheduler = () => {
  const [showModal, setShowModal] = useState(false);
  const [events, setEvents] = useState([]);
  const [isEdit, setIsEdit] = useState(false);

  const [form, setForm] = useState({
    id: null,
    title: "",
    start: null,
    end: null,
    color: "#ff7426",
    reminder: 15,
  });

  const API_URL = "http://localhost:5000/api/events"; // backend URL

  /* 🔔 Notification Permission */
  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  /* 📦 Load Events from backend */
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(API_URL);
        const parsed = res.data.map((ev) => ({
          ...ev,
          start: new Date(ev.start),
          end: new Date(ev.end),
          id: ev._id, // MongoDB id
        }));
        setEvents(parsed);
      } catch (err) {
        console.error("Failed to load events:", err);
      }
    };
    fetchEvents();
  }, []);

  /* ➕ ADD EVENT MODAL */
  const openAddModal = (startDate = new Date(), endDate = null) => {
    const start = startDate instanceof Date ? startDate : new Date(startDate);
    const end =
      endDate instanceof Date
        ? endDate
        : new Date(start.getTime() + 60 * 60 * 1000);

    setIsEdit(false);
    setForm({
      id: null,
      title: "",
      start,
      end,
      color: "#ff7426",
      reminder: 15,
    });
    setShowModal(true);
  };

  /* 💾 SAVE / UPDATE EVENT */
  const saveEvent = async () => {
    if (!form.title || !form.start || !form.end) return;

    const updatedEvent = {
      title: form.title,
      start: form.start,
      end: form.end,
      color: form.color,
      reminder: form.reminder,
    };

    try {
      if (isEdit) {
        // Update existing event
        const res = await axios.put(`${API_URL}/${form.id}`, updatedEvent);
        setEvents((prev) =>
  prev.map((ev) =>
    ev.id === form.id
      ? {
          ...res.data,
          id: res.data._id,
          start: new Date(res.data.start),
          end: new Date(res.data.end),
        }
      : ev
  )
);

      } else {
        // Create new event
        const res = await axios.post(API_URL, updatedEvent);
        setEvents((prev) => [
  ...prev,
  {
    ...res.data,
    id: res.data._id,
    start: new Date(res.data.start),
    end: new Date(res.data.end),
  },
]);


      }

      scheduleReminder(updatedEvent);
      setShowModal(false);
    } catch (err) {
      console.error("Error saving event:", err);
      alert("Failed to save event. Please try again.");
    }
  };

  /* 🗑 DELETE EVENT */
  const deleteEvent = async () => {
    try {
      await axios.delete(`${API_URL}/${form.id}`);
      setEvents((prev) => prev.filter((ev) => ev.id !== form.id));
      setShowModal(false);
    } catch (err) {
      console.error("Error deleting event:", err);
      alert("Failed to delete event.");
    }
  };

  /* 📅 TODAY EVENTS */
  const todaysEvents = events.filter((ev) =>
    moment(ev.start).isSame(moment(), "day")
  );

  /* ✏ EDIT EVENT */
  const onSelectEvent = (event) => {
    setIsEdit(true);
    setForm({
      ...event,
      start: new Date(event.start),
      end: new Date(event.end),
    });
    setShowModal(true);
  };

  /* 🔄 DRAG & DROP */
  const onEventDrop = async ({ event, start, end }) => {
    const updated = {
      title: event.title,
      start: new Date(start),
      end: new Date(end),
      color: event.color,
      reminder: event.reminder,
    };

    try {
      const res = await axios.put(`${API_URL}/${event.id}`, updated);
     setEvents((prev) =>
  prev.map((ev) =>
    ev.id === event.id
      ? {
          ...res.data,
          id: res.data._id,
          start: new Date(res.data.start),
          end: new Date(res.data.end),
        }
      : ev
  )
);

      scheduleReminder(updated);
    } catch (err) {
      console.error("Error updating event:", err);
      alert("Failed to update event.");
    }
  };

  /* 🎨 Event Style */
  const eventStyleGetter = (event) => ({
    style: {
      backgroundColor: event.color || "#ff7426",
      borderRadius: "8px",
      color: "#fff",
      border: "none",
    },
  });

  /* ⏰ REMINDER */
  const scheduleReminder = (event) => {
    if (!event.reminder || event.reminder === 0) return;

    const reminderTime =
      new Date(event.start).getTime() - event.reminder * 60000;
    const delay = reminderTime - Date.now();
    if (delay <= 0) return;

    setTimeout(() => {
      const stored =
        JSON.parse(localStorage.getItem("sf_notifications")) || [];
      stored.unshift({
        id: Date.now(),
        title: "Event Reminder",
        message: `${event.title} is starting soon`,
        time: new Date().toISOString(),
        read: false,
      });
      localStorage.setItem("sf_notifications", JSON.stringify(stored));
      window.dispatchEvent(new Event("sf-notification"));
    }, delay);
  };

  return (
    <div className="eventscheduler-container">
      <Sidebar />

      <div className="eventscheduler-content-wrapper">
        <Navbar />

        <main className="eventscheduler-main">
          {/* TOP */}
          <div className="sf-top-section">
            <div className="sf-welcome-wrapper">
              <WelcomeBanner
                subtitle="Welcome To"
                title="Your Event Scheduler"
                description="Stay on track and never miss a moment."
                buttonText="+ Add Event"
                onButtonClick={() => openAddModal(new Date())}
              />
            </div>

            <div className="sf-today-events-wrapper">
              <TodayEvents events={todaysEvents} />
            </div>
          </div>

          {/* CALENDAR */}
          <div className="sf-calendar-wrapper">
            <DragAndDropCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              selectable
              onSelectSlot={({ start, end }) => openAddModal(start, end)}
              onSelectEvent={onSelectEvent}
              onEventDrop={onEventDrop}
              resizable
              eventPropGetter={eventStyleGetter}
              style={{ height: 500 }}
            />
          </div>

          {/* ALL EVENTS */}
          <AllEventsList events={events} onEdit={onSelectEvent} />

          {/* MODAL */}
          <EventModal
            show={showModal}
            isEdit={isEdit}
            form={form}
            setForm={setForm}
            onSave={saveEvent}
            onDelete={deleteEvent}
            onClose={() => setShowModal(false)}
          />
        </main>
      </div>
    </div>
  );
};

export default Eventscheduler;
