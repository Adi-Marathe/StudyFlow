// src/services/authServices.js
import axios from 'axios';

const API_URL = 'https://studyflow-xh1t.onrender.com/api';

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

// Forgot password — send OTP
export const forgotPassword = async (email) => {
  const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
  return response.data;
};

// Verify OTP
export const verifyOtp = async (email, otp) => {
  const response = await axios.post(`${API_URL}/auth/verify-otp`, { email, otp });
  return response.data;
};

// Reset password
export const resetPassword = async (resetToken, newPassword) => {
  const response = await axios.post(`${API_URL}/auth/reset-password`, { resetToken, newPassword });
  return response.data;
};
