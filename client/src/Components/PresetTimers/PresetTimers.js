import React from "react";
import "./PresetTimers.css";

function PresetTimers({ timers, onSelect, onDelete }) {
  return (
    <div className="preset-box">
      <h3>Your Preset Timers</h3>

      {timers.length === 0 && <p>No presets added</p>}

      {timers.map((preset) => (
        <div className="preset-card" key={preset._id}>
          <div onClick={() => onSelect(preset)} style={{ cursor: "pointer" }}>
            <strong>{preset.label}</strong>
            <p>
              {preset.focusTime} / {preset.shortBreak} / {preset.longBreak} min
            </p>
          </div>
          <button onClick={() => onDelete(preset._id)}>✕</button>
        </div>
      ))}
    </div>
  );
}

export default PresetTimers;