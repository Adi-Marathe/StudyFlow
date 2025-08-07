import React, { useState } from 'react';
import './Auth.css';
import { useNavigate } from 'react-router-dom';
import { register } from '../../services/authServices';
import { toast } from 'react-toastify';

const Signup = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
  });

  const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email);
  const validateName = (name) => /^[A-Za-z\s]{3,}$/.test(name.trim());

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, password } = form;
    let nameError = '', emailError = '', passwordError = '';

    if (!validateName(name)) {
      nameError = 'Name must be at least 3 characters and contain only letters and spaces';
    }

    if (!validateEmail(email)) {
      emailError = 'Please enter a valid email address';
    }

    if (password.length < 8) {
      passwordError = 'Password must be at least 8 characters long';
    } else if (!/[A-Z]/.test(password)) {
      passwordError = 'Password must include at least one uppercase letter (A-Z)';
    } else if (!/[0-9]/.test(password)) {
      passwordError = 'Password must include at least one number (0-9)';
    } else if (!/[!@#$%^&*]/.test(password)) {
      passwordError = 'Password must include at least one special character (!@#$...)';
    }

    const updatedErrors = { name: nameError, email: emailError, password: passwordError };
    setErrors(updatedErrors);

    const hasErrors = Object.values(updatedErrors).some((msg) => msg !== '');
    if (hasErrors) return;

    try {
      const res = await register(form);
      toast.success('Welcome to StudyFlow! Your account has been created. Please log in to continue.!' || res.message);
      setTimeout(() => navigate('/login'), 1500); // short delay before redirect
    } catch (err) {
      const msg = err?.response?.data?.message;

      if (msg?.toLowerCase().includes('already exists')) {
        toast.error('This email is already registered. Try logging in instead.');
      } else {
        toast.error(msg || 'Oops! We couldn’t sign you up. Please try again.');
      }
    }
  };

  return (
    <div className="login-container">
      <button onClick={() => navigate('/')} className="close-btn" aria-label="Close">✕</button>

      <form className="login-box" onSubmit={handleSubmit} noValidate>
        <h2>Create your profile</h2>

        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          className={errors.name ? 'error' : ''}
        />
        {errors.name && <span className="error-text">⚠ {errors.name}</span>}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className={errors.email ? 'error' : ''}
        />
        {errors.email && <span className="error-text">⚠ {errors.email}</span>}

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className={errors.password ? 'error' : ''}
        />
        {errors.password && <span className="error-text">⚠ {errors.password}</span>}

        <button type="submit" className="login-btn">SIGN UP</button>

        <p className="mobile-signup-text">
          Already have an account?{' '}
          <span onClick={() => navigate('/login')} className="signup-link">Log in</span>
        </p>
      </form>

      <button onClick={() => navigate('/login')} className="signup-btn">LOG IN</button>
    </div>
  );
};

export default Signup;
