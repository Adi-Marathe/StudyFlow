// src/Components/EventModal/EventModal.js
import React, { useState, useEffect } from 'react';
import './EventModal.css';

const defaultColors = ['#7e2cc0ff', '#da6a2aff', '#2e85ccff', '#2aad2fff', '#b335c9ff'];

const EventModal = ({ isOpen, onClose, onSave, onDelete, selectedEvent }) => {
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  // const [type, setType] = useState('other');
  const [color, setColor] = useState(defaultColors[0]);
  // const [description, setDescription] = useState('');
  // const [reminder, setReminder] = useState(true);

  useEffect(() => {
    if (selectedEvent) {
      setTitle(selectedEvent.title || '');
      setStart(selectedEvent.start ? new Date(selectedEvent.start).toISOString().slice(0, 16) : '');
      setEnd(selectedEvent.end ? new Date(selectedEvent.end).toISOString().slice(0, 16) : '');
      // setType(selectedEvent.type || 'other');
      setColor(selectedEvent.color || defaultColors[0]);
      // setDescription(selectedEvent.description || '');
      // setReminder(selectedEvent.reminder !== false);
    } else {
      setTitle('');
      setStart('');
      setEnd('');
      // setType('other');
      setColor(defaultColors[0]);
      // setDescription('');
      // setReminder(true);
    }
  }, [selectedEvent]);

  const handleSave = async () => {
  const eventData = { title, start, end, color };

  try {
    const res = await fetch('http://localhost:5000/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    });

    if (!res.ok) throw new Error('Failed to save event');
    const savedEvent = await res.json();

    onSave(savedEvent); // Update UI
    onClose();
  } catch (error) {
    console.error(error);
  }
};

  const handleSubmit = () => {
    if (!title || !start || !end) {
      alert('Please fill all required fields.');
      return;
    }

    const event = {
      ...selectedEvent,
      title,
      start: new Date(start),
      end: new Date(end),
      // type,
      color,
      // description,
      // reminder,
    };

    onSave(event);
  };

  if (!isOpen) return null;

  return (
    <div className="event-modal-overlay">
      <div className="event-modal-box">
        <h2>{selectedEvent ? 'Edit Event' : 'Add Event'}</h2>

        <div className="event-form">
          <input
            type="text"
            placeholder="Event Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="event-row">
            <label>Start:</label>
            <input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>

          <div className="event-row">
            <label>End:</label>
            <input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>

          {/* <div className="event-row">
            <label>Type:</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="meeting">Meeting</option>
              <option value="personal">Personal</option>
              <option value="reminder">Reminder</option>
              <option value="other">Other</option>
            </select>
          </div> */}

          <div className="event-row">
            <label>Color:</label>
            <div className="color-palette">
              {defaultColors.map((c) => (
                <span
                  key={c}
                  className={`color-circle ${color === c ? 'selected' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          {/* <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>

          <div className="event-row">
            <label>
              <input
                type="checkbox"
                checked={reminder}
                onChange={() => setReminder(!reminder)}
              />
              &nbsp; Reminder
            </label>
          </div> */}
        </div>

        <div className="event-modal-actions">
          <button className="cancel" onClick={onClose}>Cancel</button>
          {selectedEvent && (
            <button className="delete" onClick={() => onDelete(selectedEvent)}>Delete</button>
          )}
          <button className="save" onClick={handleSubmit}>
            {selectedEvent ? 'Update' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
