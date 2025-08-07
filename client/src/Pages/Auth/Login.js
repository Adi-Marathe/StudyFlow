import React, { useState } from 'react';
import './Auth.css';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/authServices';
import { toast } from 'react-toastify';

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });

  const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let emailError = '';
    let passwordError = '';

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

    setErrors({ email: emailError, password: passwordError });

    const hasErrors = emailError || passwordError;
    if (hasErrors) return;

    try {
      const data = await login({ email, password });
      toast.success('🎉 Login successful!');
      localStorage.setItem('token', data.token); // save JWT token
      navigate('/dashboard'); // redirect after login
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || 'Invalid email or password'
      );
    }
  };

  return (
    <div className="login-container">
      <button onClick={() => navigate('/')} className="close-btn">✕</button>

      <form className="login-box" onSubmit={handleSubmit} noValidate>
        <h2>Log in</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setErrors({ ...errors, email: '' });
          }}
          className={errors.email ? 'error' : ''}
        />
        {errors.email && <span className="error-text">⚠ {errors.email}</span>}

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setErrors({ ...errors, password: '' });
          }}
          className={errors.password ? 'error' : ''}
        />
        {errors.password && <span className="error-text">⚠ {errors.password}</span>}

        <button className="login-btn" type="submit">
          LOG IN
        </button>

        <p className="mobile-signup-text">
          Don’t have an account?{' '}
          <span onClick={() => navigate('/register')} className="signup-link">Sign up</span>
        </p>
      </form>

      <button onClick={() => navigate('/register')} className="signup-btn">SIGN UP</button>
    </div>
  );
};

export default Login;
