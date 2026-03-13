import React from "react";
import "./EventModal.css";

/* ✅ SAFE DATE FORMATTER */
const formatLocalDateTime = (date) => {
  if (!date) return "";

  const d = new Date(date);
  if (isNaN(d.getTime())) return ""; // 🔥 IMPORTANT FIX

  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d - tzOffset).toISOString().slice(0, 16);
};

const EventModal = ({
  show,
  onClose,
  onSave,
  onDelete,
  isEdit,
  form,
  setForm,
}) => {
  if (!show) return null;

  const handleSave = () => {
    if (!form.title.trim()) {
      alert("Event title is required");
      return;
    }

    if (form.start && form.end && new Date(form.end) < new Date(form.start)) {
      alert("End date cannot be before start date");
      return;
    }

    onSave();
  };

  return (
    <div className="sf-modal-overlay">
      <div className="sf-modal">
        <h3>{isEdit ? "Edit Event" : "Add Event"}</h3>

        {/* TITLE */}
        <input
          type="text"
          placeholder="Event title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        {/* START */}
        <label>Start Date & Time</label>
        <input
          type="datetime-local"
          value={formatLocalDateTime(form.start)}
          onChange={(e) =>
            setForm({
              ...form,
              start: e.target.value ? new Date(e.target.value) : null,
            })
          }
        />

        {/* END */}
        <label>End Date & Time</label>
        <input
          type="datetime-local"
          value={formatLocalDateTime(form.end)}
          onChange={(e) =>
            setForm({
              ...form,
              end: e.target.value ? new Date(e.target.value) : null,
            })
          }
        />

        {/* REMINDER */}
        <label>Reminder</label>
        <select
          value={form.reminder}
          onChange={(e) =>
            setForm({ ...form, reminder: Number(e.target.value) })
          }
        >
          <option value={0}>No Reminder</option>
          <option value={5}>5 minutes before</option>
          <option value={15}>15 minutes before</option>
          <option value={30}>30 minutes before</option>
          <option value={60}>1 hour before</option>
          <option value={1440}>1 day before</option>
        </select>

        {/* COLOR */}
        <label>Event Color</label>
        <input
          type="color"
          value={form.color}
          onChange={(e) => setForm({ ...form, color: e.target.value })}
        />

        {/* ACTIONS */}
        <div className="sf-modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>

          {isEdit && (
            <button className="btn-danger" onClick={onDelete}>
              Delete
            </button>
          )}

          <button className="btn-primary" onClick={handleSave}>
            {isEdit ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
