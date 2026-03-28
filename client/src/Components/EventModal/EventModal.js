import React, { useRef, useEffect } from "react";
import { X, CalendarPlus, Trash2, Save, MapPin, AlignLeft, ExternalLink } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./EventModal.css";

/* ─── Safe local datetime formatter ─── */
const formatLocalDateTime = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d - tzOffset).toISOString().slice(0, 16);
};

/* ─── Preset color swatches ─── */
const COLOR_SWATCHES = [
  "#ff7426",
  "#4d2c5e",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

const EventModal = ({ show, onClose, onSave, onDelete, isEdit, form, setForm }) => {
  const locationInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  /* ─── Google Places Autocomplete (loads only if API key exists) ─── */
  useEffect(() => {
    if (!show) return;
    if (!window.google?.maps?.places) return;
    if (autocompleteRef.current) return; // already initialized

    const input = locationInputRef.current;
    if (!input) return;

    autocompleteRef.current = new window.google.maps.places.Autocomplete(input, {
      types: ["geocode", "establishment"],
    });

    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current.getPlace();
      if (place?.formatted_address) {
        setForm((prev) => ({ ...prev, location: place.formatted_address }));
      }
    });

    return () => {
      autocompleteRef.current = null;
    };
  }, [show]);

  if (!show) return null;

  /* ─── Open in Google Maps ─── */
  const openInMaps = () => {
    if (!form.location?.trim()) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(form.location)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleSave = () => {
    if (!form.title.trim()) {
      toast.error("Event title is required");
      return;
    }
    if (!form.start) {
      toast.error("Start date & time is required");
      return;
    }
    if (!form.end) {
      toast.error("End date & time is required");
      return;
    }
    if (new Date(form.end) < new Date(form.start)) {
      toast.error("End time cannot be before start time");
      return;
    }
    onSave();
    toast.success(isEdit ? "Event updated!" : "Event added!");
  };

  const handleDelete = () => {
    onDelete();
    toast.success("Event deleted");
  };

  return (
    <div className="em-overlay">
      <div className="em-container">

        {/* ── HEADER ── */}
        <div className="em-header">
          <div className="em-header-left">
            <div className="em-icon">
              <CalendarPlus size={20} />
            </div>
            <h2 className="em-title">
              {isEdit ? "Edit Event" : "Add New Event"}
            </h2>
          </div>
          <button className="em-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* ── FORM ── */}
        <div className="em-form">

          {/* Title */}
          <div className="em-form-group">
            <label className="em-label">Event Title</label>
            <input
              type="text"
              className="em-input"
              placeholder="Enter event title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          {/* Description */}
          <div className="em-form-group">
            <label className="em-label">
              <AlignLeft size={13} />
              Description
            </label>
            <textarea
              className="em-input em-textarea"
              placeholder="Add a description (optional)"
              value={form.description || ""}
              maxLength={300}
              rows={3}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <span className="em-char-count">
              {(form.description || "").length}/300
            </span>
          </div>

          {/* Location */}
          <div className="em-form-group">
            <label className="em-label">
              <MapPin size={13} />
              Location
            </label>
            <div className="em-location-wrapper">
              <MapPin size={15} className="em-location-icon" />
              <input
                ref={locationInputRef}
                type="text"
                className="em-input em-location-input"
                placeholder="Add address or place"
                value={form.location || ""}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
              {form.location?.trim() && (
                <button
                  type="button"
                  className="em-maps-btn"
                  onClick={openInMaps}
                  title="Open in Google Maps"
                >
                  <ExternalLink size={14} />
                </button>
              )}
            </div>
            {!window.google?.maps?.places && (
              <span className="em-maps-hint">
                Add your Google Maps API key to enable autocomplete
              </span>
            )}
          </div>

          {/* Start & End — side by side */}
          <div className="em-row">
            <div className="em-form-group">
              <label className="em-label">Start</label>
              <input
                type="datetime-local"
                className="em-input"
                value={formatLocalDateTime(form.start)}
                onChange={(e) =>
                  setForm({ ...form, start: e.target.value ? new Date(e.target.value) : null })
                }
              />
            </div>
            <div className="em-form-group">
              <label className="em-label">End</label>
              <input
                type="datetime-local"
                className="em-input"
                value={formatLocalDateTime(form.end)}
                onChange={(e) =>
                  setForm({ ...form, end: e.target.value ? new Date(e.target.value) : null })
                }
              />
            </div>
          </div>

          {/* Reminder */}
          <div className="em-form-group">
            <label className="em-label">Reminder</label>
            <select
              className="em-input em-select"
              value={form.reminder}
              onChange={(e) => setForm({ ...form, reminder: Number(e.target.value) })}
            >
              <option value={0}>No Reminder</option>
              <option value={5}>5 minutes before</option>
              <option value={15}>15 minutes before</option>
              <option value={30}>30 minutes before</option>
              <option value={60}>1 hour before</option>
              <option value={1440}>1 day before</option>
            </select>
          </div>

          {/* Color */}
          <div className="em-form-group">
            <label className="em-label">Event Color</label>
            <div className="em-color-row">
              {COLOR_SWATCHES.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`em-swatch ${form.color === c ? "em-swatch--active" : ""}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setForm({ ...form, color: c })}
                  aria-label={c}
                />
              ))}
              <label className="em-color-custom" title="Custom color">
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                />
                <span
                  className="em-color-custom-preview"
                  style={{ backgroundColor: form.color }}
                />
              </label>
            </div>
          </div>

          {/* ── ACTIONS ── */}
          <div className="em-actions">
            <button className="em-btn em-btn--cancel" onClick={onClose}>
              Cancel
            </button>
            {isEdit && (
              <button className="em-btn em-btn--danger" onClick={handleDelete}>
                <Trash2 size={15} />
                Delete
              </button>
            )}
            <button className="em-btn em-btn--primary" onClick={handleSave}>
              <Save size={15} />
              {isEdit ? "Update" : "Save Event"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EventModal;