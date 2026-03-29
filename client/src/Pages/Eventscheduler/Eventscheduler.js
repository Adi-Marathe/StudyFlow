import React, { useState, useEffect } from "react";
import moment from "moment";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Sidebar from "../../Components/Sidebar/Sidebar";
import Navbar from "../../Components/Navbar/Navbar";
import WelcomeBanner from "../../Components/WelcomeBanner/WelcomeBanner";
import TodayEvents from "../../Components/TodayEvents/TodayEvents";
import AllEventsList from "../../Components/AllEventsList/AllEventsList";
import EventModal from "../../Components/EventModal/EventModal";
import EventCalendar from "../../Components/EventCalendar/EventCalendar";

import "./Eventscheduler.css";

/* ─────────────────────────────────────────
   CONFIG
───────────────────────────────────────── */
const API_URL = "https://studyflow-xh1t.onrender.com/api/events";

const EMPTY_FORM = {
  id: null,
  title: "",
  description: "",
  location: "",
  start: null,
  end: null,
  color: "#ff7426",
  reminder: 15,
};

/* Returns axios auth header or null if no token */
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    toast.error("You are not logged in");
    return null;
  }
  return { Authorization: `Bearer ${token}` };
};

/* Map raw backend event → component-ready shape */
const parseEvent = (ev) => ({
  ...ev,
  id: ev._id,
  start: new Date(ev.start),
  end: new Date(ev.end),
});

/* ─────────────────────────────────────────
   COMPONENT
───────────────────────────────────────── */
const Eventscheduler = () => {
  const [events,    setEvents]    = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEdit,    setIsEdit]    = useState(false);
  const [form,      setForm]      = useState(EMPTY_FORM);

  /* 🔔 Notification permission */
  useEffect(() => {
    if ("Notification" in window) Notification.requestPermission();
  }, []);

  /* 📦 Load all events on mount */
  useEffect(() => {
    const fetchEvents = async () => {
      const headers = getAuthHeader();
      if (!headers) return;
      try {
        const res = await axios.get(API_URL, { headers });
        setEvents(res.data.map(parseEvent));
      } catch (err) {
        console.error("Failed to load events:", err);
        toast.error(err.response?.data?.error || "Failed to load events");
      }
    };
    fetchEvents();
  }, []);

  /* ─── Open ADD modal (from button or calendar slot click) ─── */
  const openAddModal = (startDate = new Date(), endDate = null) => {
    const start = startDate instanceof Date ? startDate : new Date(startDate);
    const end   = endDate instanceof Date
      ? endDate
      : new Date(start.getTime() + 60 * 60 * 1000); // default +1 hr

    setIsEdit(false);
    setForm({ ...EMPTY_FORM, start, end });
    setShowModal(true);
  };

  /* ─── Open EDIT modal (from calendar event click or AllEventsList) ─── */
  const onSelectEvent = (event) => {
    setIsEdit(true);
    setForm({
      ...event,
      start: new Date(event.start),
      end:   new Date(event.end),
    });
    setShowModal(true);
  };

  /* ─── SAVE (create or update) ─── */
  const saveEvent = async () => {
    const headers = getAuthHeader();
    if (!headers) return;

    const payload = {
      title:       form.title,
      description: form.description  || "",
      location:    form.location     || "",
      start:       form.start,
      end:         form.end,
      color:       form.color,
      reminder:    form.reminder,
    };

    try {
      if (isEdit) {
        const res = await axios.put(`${API_URL}/${form.id}`, payload, { headers });
        const updated = parseEvent(res.data);
        setEvents((prev) => prev.map((ev) => (ev.id === form.id ? updated : ev)));
      } else {
        const res = await axios.post(API_URL, payload, { headers });
        setEvents((prev) => [...prev, parseEvent(res.data)]);
      }

      scheduleReminder({ ...payload, title: form.title });
      setShowModal(false);
    } catch (err) {
      console.error("Error saving event:", err);
      toast.error(err.response?.data?.error || "Failed to save event");
    }
  };

  /* ─── DELETE ─── */
  const deleteEvent = async () => {
    const headers = getAuthHeader();
    if (!headers) return;

    try {
      await axios.delete(`${API_URL}/${form.id}`, { headers });
      setEvents((prev) => prev.filter((ev) => ev.id !== form.id));
      setShowModal(false);
    } catch (err) {
      console.error("Error deleting event:", err);
      toast.error(err.response?.data?.error || "Failed to delete event");
    }
  };

  /* ─── DRAG & DROP reschedule ─── */
  const onEventDrop = async ({ event, start, end }) => {
    const headers = getAuthHeader();
    if (!headers) return;

    const payload = {
      title:       event.title,
      description: event.description || "",
      location:    event.location    || "",
      start:       new Date(start),
      end:         new Date(end),
      color:       event.color,
      reminder:    event.reminder,
    };

    try {
      const res = await axios.put(`${API_URL}/${event.id}`, payload, { headers });
      const updated = parseEvent(res.data);
      setEvents((prev) => prev.map((ev) => (ev.id === event.id ? updated : ev)));
      scheduleReminder({ ...payload, title: event.title });
    } catch (err) {
      console.error("Error rescheduling event:", err);
      toast.error(err.response?.data?.error || "Failed to reschedule event");
    }
  };

  /* ─── Local reminder scheduler ─── */
  const scheduleReminder = (event) => {
    if (!event.reminder || event.reminder === 0) return;
    const delay = new Date(event.start).getTime() - event.reminder * 60000 - Date.now();
    if (delay <= 0) return;

    setTimeout(() => {
      const stored = JSON.parse(localStorage.getItem("sf_notifications")) || [];
      stored.unshift({
        id:      Date.now(),
        title:   "Event Reminder",
        message: `${event.title} is starting soon`,
        time:    new Date().toISOString(),
        read:    false,
      });
      localStorage.setItem("sf_notifications", JSON.stringify(stored));
      window.dispatchEvent(new Event("sf-notification"));
    }, delay);
  };

  /* ─── Today filter (for TodayEvents panel) ─── */
  const todaysEvents = events.filter((ev) =>
    moment(ev.start).isSame(moment(), "day")
  );

  /* ─────────────────────────────────────────
     RENDER
  ───────────────────────────────────────── */
  return (
    <div className="eventscheduler-container">
      <Sidebar />

      <div className="eventscheduler-content-wrapper">
        <Navbar />

        <main className="eventscheduler-main">

          {/* ── TOP BANNER + TODAY EVENTS ── */}
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

          {/* ── CALENDAR ── */}
          <EventCalendar
            events={events}
            onSelectSlot={openAddModal}
            onSelectEvent={onSelectEvent}
            onEventDrop={onEventDrop}
          />

          {/* ── ALL EVENTS GRID ── */}
          <AllEventsList events={events} onEdit={onSelectEvent} />

          {/* ── MODAL ── */}
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