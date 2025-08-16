// src/services/timerServices.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/timers';

// ✅ Get all timer presets
export const getPresets = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// ✅ Add a new preset
export const addPreset = async (presetData) => {
  const response = await axios.post(API_URL, presetData);
  return response.data;
};

// ✅ Delete a preset
export const deletePreset = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};
