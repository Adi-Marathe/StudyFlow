// src/pages/Eventscheduler.js
import React, { useState, useEffect } from "react";
import Sidebar from "../../Components/Sidebar/Sidebar";
import "./Eventscheduler.css";
import Navbar from "../../Components/Navbar/Navbar";
import WelcomeBanner from "../../Components/WelcomeBanner/WelcomeBanner";
import EventCalendar from "../../Components/EventCalendar/EventCalendar";
import EventModal from "../../Components/EventModal/EventModal";
import EventList from "../../Components/EventList/EventList";
import AllEvents from "../../Components/AllEvents/AllEvents";


function Eventscheduler() {
  const [events, setEvents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const storedEvents = localStorage.getItem("events");
    if (storedEvents) {
      setEvents(JSON.parse(storedEvents));
    }
  }, []);

  const saveEvents = (newEvents) => {
    setEvents(newEvents);
    localStorage.setItem("events", JSON.stringify(newEvents));
  };

  const handleAddEventClick = () => {
    setSelectedEvent(null);
    setModalOpen(true);
  };

  const handleSaveEvent = (event) => {
    const newEvent = {
      ...event,
      id: event.id || Date.now(),
      start: new Date(event.start),
      end: new Date(event.end),
    };

    // Validate: End should be after Start
    if (newEvent.end <= newEvent.start) {
      alert("End time must be after start time.");
      return;
    }

    let updatedEvents;
    if (selectedEvent) {
      updatedEvents = events.map((e) =>
        e.id === selectedEvent.id ? newEvent : e
      );
    } else {
      updatedEvents = [...events, newEvent];
      if (newEvent.reminder !== false) {
        scheduleReminder(newEvent);
      }
    }

    saveEvents(updatedEvents);
    console.log("Saved Events:", updatedEvents);
    setModalOpen(false);
  };

  const handleDeleteEvent = (eventToDelete) => {
    const updatedEvents = events.filter((e) => e.id !== eventToDelete.id);
    saveEvents(updatedEvents);
    setModalOpen(false);
  };

  const scheduleReminder = (event) => {
    const timeDiff = new Date(event.start).getTime() - new Date().getTime();
    if (timeDiff > 0) {
      setTimeout(() => {
        alert(`🔔 Reminder: "${event.title}" is starting soon!`);
      }, timeDiff);
    }
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const handleSelectSlot = (slotInfo) => {
    setSelectedEvent({
      title: "",
      start: slotInfo.start,
      end: slotInfo.end,
    });
    setModalOpen(true);
  };

  return (
    <div className="eventscheduler-container">
      <Sidebar />

      <div className="eventscheduler-content-wrapper">
        <Navbar />
        <main className="eventscheduler-main">

          <div className="event-list">
           <WelcomeBanner
            subtitle="Welcome To"
            title="Your Event Scheduler"
            description="Stay on track and never miss a moment. Let's plan your events with ease and keep your days smooth and sorted!"
            buttonText="+ Add Event"
            onButtonClick={handleAddEventClick}
            animation="https://lottie.host/12047cbf-ae5e-42c1-8fc7-edff6e6eaa4f/jTKxWt1KmD.lottie"
          />
          <EventList events={events} onSelectEvent={handleSelectEvent} />

          </div>

          <div className="calendar-box">
            <EventCalendar
              events={events}
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
            />
          </div>

          <EventModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            onSave={handleSaveEvent}
            onDelete={handleDeleteEvent}
            selectedEvent={selectedEvent}
          />

          <div className="all-events"> {/* All Events Section */}
      <AllEvents events={events} />
    </div>

        </main>
      </div>
    </div>
  );
}

export default Eventscheduler;
