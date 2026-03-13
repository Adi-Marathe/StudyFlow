import React, { useState } from "react";
import "./TimerModal.css";

function TimerModal({ onClose, onApply }) {
  const [label, setLabel] = useState("");
  const [focus, setFocus] = useState("");
  const [shortBreak, setShortBreak] = useState("");
  const [longBreak, setLongBreak] = useState("");

  const handleNumberChange = (setter) => (e) => {
    const value = e.target.value;
    if (value === "" || Number(value) >= 1) {
      setter(value);
    }
  };

  const handleSave = () => {
    if (!focus || !shortBreak || !longBreak) return;

    onApply({
      label: label || "Custom Timer",
      focusTime: Number(focus),
      shortBreak: Number(shortBreak),
      longBreak: Number(longBreak),
    });

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2 className="modal-title">Set Custom Time</h2>

        <div className="custom-inputs">
          <input
            type="text"
            placeholder="Label (e.g. Study Time)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="full-width-input"
          />

          <div className="custom-time-row">
            <input
              type="number"
              min={1}
              step={1}
              placeholder="Focus (min)"
              value={focus}
              onChange={handleNumberChange(setFocus)}
            />
            <input
              type="number"
              min={1}
              step={1}
              placeholder="Short (min)"
              value={shortBreak}
              onChange={handleNumberChange(setShortBreak)}
            />
            <input
              type="number"
              min={1}
              step={1}
              placeholder="Long (min)"
              value={longBreak}
              onChange={handleNumberChange(setLongBreak)}
            />
          </div>

          <div className="action-buttons">
            <button className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button className="save-btn" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TimerModal;