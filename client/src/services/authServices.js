// src/services/authServices.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Register user
export const register = async (userData) => {
  const response = await axios.post(`${API_URL}/auth/register`, userData);
  return response.data;
};

// Login user
export const login = async (userData) => {
  const response = await axios.post(`${API_URL}/auth/login`, userData);
  return response.data;
};
