import React, { useEffect, useState } from 'react';
import './TimerModal.css';
import { getPresets, addPreset, deletePreset } from '../../services/timerServices'; // ✅ Import API functions

function TimerModal({ onClose, onApply }) {
  const defaultPresets = [
    { label: "Classic (25-5-15)", focus: 25, short: 5, long: 15 },
    { label: "Deep Work (50-10-20)", focus: 50, short: 10, long: 20 },
    { label: "Study Mode (60-10-30)", focus: 60, short: 10, long: 30 }
  ];

  const [presets, setPresets] = useState([]);
  const [customLabel, setCustomLabel] = useState('');
  const [customFocus, setCustomFocus] = useState('');
  const [customShort, setCustomShort] = useState('');
  const [customLong, setCustomLong] = useState('');

  // ✅ Fetch presets from backend on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getPresets();
        setPresets([...defaultPresets, ...data]);
      } catch (err) {
        console.error("Error fetching presets:", err);
      }
    };
    fetchData();
  }, []);

  // ✅ Add new custom preset to backend
  const handleSaveCustom = async () => {
    if (!customFocus || !customShort || !customLong) return;

    const label = customLabel.trim() !== '' ? customLabel.trim() : 'Custom';
    const newPreset = {
      label: `${label} (${customFocus}-${customShort}-${customLong})`,
      focus: parseInt(customFocus),
      short: parseInt(customShort),
      long: parseInt(customLong),
    };

    try {
      const savedPreset = await addPreset(newPreset);
      setPresets([...presets, savedPreset]);
      setCustomLabel('');
      setCustomFocus('');
      setCustomShort('');
      setCustomLong('');
    } catch (err) {
      console.error("Failed to save custom preset:", err);
    }
  };

  // ✅ Use selected preset
  const handlePresetClick = (preset) => {
    onApply({
      focusTime: preset.focus,
      shortBreak: preset.short,
      longBreak: preset.long,
      label: preset.label,
    });
    onClose();
  };

  // ✅ Delete custom preset from backend
  const handleDeleteCustom = async (id) => {
    try {
      await deletePreset(id);
      setPresets(presets.filter(p => p._id !== id));
      onApply({
        focusTime: 0,
        shortBreak: 0,
        longBreak: 0,
        label: '',
      });
    } catch (err) {
      console.error("Failed to delete preset:", err);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2 className="modal-title">Select a Pomodoro Preset</h2>

        <div className="preset-list scrollable">
          {presets.map((preset, index) => {
            const isCustom = !defaultPresets.some(dp => dp.label === preset.label);
            return (
              <div key={preset._id || index} className="preset-item">
                <button className="preset-button" onClick={() => handlePresetClick(preset)}>
                  {preset.label}
                </button>
                {isCustom && (
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteCustom(preset._id)}
                    title="Delete preset"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="custom-inputs">
          <h4 className="add-custom-title">Add Custom Time</h4>
          <input
            type="text"
            placeholder="Label (e.g. Math Focus)"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            className="full-width-input"
          />
          <div className="custom-time-row">
            <input
              type="number"
              placeholder="Focus (min)"
              value={customFocus}
              onChange={(e) => setCustomFocus(e.target.value)}
            />
            <input
              type="number"
              placeholder="Short (min)"
              value={customShort}
              onChange={(e) => setCustomShort(e.target.value)}
            />
            <input
              type="number"
              placeholder="Long (min)"
              value={customLong}
              onChange={(e) => setCustomLong(e.target.value)}
            />
          </div>
          <div className="action-buttons">
            <button className="save-btn" onClick={handleSaveCustom}>Save</button>
            <button className="cancel-btn" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TimerModal;
