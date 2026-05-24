import React, { useState, useRef, useEffect, useCallback } from 'react';
import './Auth.css';
import { useNavigate } from 'react-router-dom';
import { forgotPassword, verifyOtp, resetPassword } from '../../services/authServices';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const navigate = useNavigate();

  // Step: 1 = enter email, 2 = verify OTP, 3 = new password
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const otpRefs = useRef([]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

  // ─── Step 1: Send OTP ──────────────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const data = await forgotPassword(email);
      toast.success('📧 ' + data.message);
      setStep(2);
      setCountdown(60);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Something went wrong. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 2: Verify OTP ─────────────────────────────────────
  const handleVerifyOtp = useCallback(async (otpValue) => {
    setError('');
    const code = otpValue || otp.join('');
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const data = await verifyOtp(email, code);
      toast.success('✅ ' + data.message);
      setResetToken(data.resetToken);
      setStep(3);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Invalid code. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [email, otp]);

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setError('');
    setLoading(true);
    try {
      const data = await forgotPassword(email);
      toast.success('📧 ' + data.message);
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  // OTP input handlers
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // numbers only

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');

    // Auto-focus next
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are filled
    if (value && index === 5) {
      const fullOtp = newOtp.join('');
      if (fullOtp.length === 6) {
        handleVerifyOtp(fullOtp);
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasted[i] || '';
    }
    setOtp(newOtp);
    // Focus last filled or submit
    const lastIdx = Math.min(pasted.length, 5);
    otpRefs.current[lastIdx]?.focus();
    if (pasted.length === 6) {
      handleVerifyOtp(pasted);
    }
  };

  // ─── Step 3: Reset Password ─────────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setError('Password must include at least one uppercase letter (A-Z)');
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setError('Password must include at least one number (0-9)');
      return;
    }
    if (!/[!@#$%^&*]/.test(newPassword)) {
      setError('Password must include at least one special character (!@#$...)');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const data = await resetPassword(resetToken, newPassword);
      toast.success('🎉 ' + data.message);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to reset password.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <button onClick={() => navigate('/login')} className="auth-close-btn" aria-label="Back to login">
        ✕
      </button>

      {/* Step Indicator */}
      <div className="fp-step-indicator">
        <div className={`fp-step-dot ${step >= 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}`}>
          {step > 1 ? '✓' : '1'}
        </div>
        <div className={`fp-step-line ${step >= 2 ? 'active' : ''}`} />
        <div className={`fp-step-dot ${step >= 2 ? 'active' : ''} ${step > 2 ? 'done' : ''}`}>
          {step > 2 ? '✓' : '2'}
        </div>
        <div className={`fp-step-line ${step >= 3 ? 'active' : ''}`} />
        <div className={`fp-step-dot ${step >= 3 ? 'active' : ''}`}>3</div>
      </div>

      {/* Step 1: Enter Email */}
      {step === 1 && (
        <form className="login-box" onSubmit={handleSendOtp} noValidate>
          <h2>Forgot Password</h2>
          <p className="fp-subtitle">Enter your registered email and we'll send you a reset code.</p>

          <input
            id="forgot-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            className={error ? 'error' : ''}
            autoFocus
          />
          {error && <span className="error-text">⚠ {error}</span>}

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? 'SENDING...' : 'SEND RESET CODE'}
          </button>

          <p className="mobile-signup-text" style={{ display: 'block' }}>
            Remember your password?{' '}
            <span onClick={() => navigate('/login')} className="signup-link">Log in</span>
          </p>
        </form>
      )}

      {/* Step 2: Verify OTP */}
      {step === 2 && (
        <div className="login-box">
          <h2>Enter Reset Code</h2>
          <p className="fp-subtitle">
            We sent a 6-digit code to <strong>{email}</strong>
          </p>

          <div className="fp-otp-container" onPaste={handleOtpPaste}>
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (otpRefs.current[idx] = el)}
                id={`otp-input-${idx}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                className={`fp-otp-input ${error ? 'error' : ''}`}
                autoFocus={idx === 0}
              />
            ))}
          </div>
          {error && <span className="error-text">⚠ {error}</span>}

          <button
            className="login-btn"
            onClick={() => handleVerifyOtp()}
            disabled={loading || otp.join('').length !== 6}
          >
            {loading ? 'VERIFYING...' : 'VERIFY CODE'}
          </button>

          <p className="fp-resend-text">
            Didn't receive the code?{' '}
            {countdown > 0 ? (
              <span className="fp-countdown">Resend in {countdown}s</span>
            ) : (
              <span onClick={handleResendOtp} className="signup-link">
                Resend Code
              </span>
            )}
          </p>
        </div>
      )}

      {/* Step 3: New Password */}
      {step === 3 && (
        <form className="login-box" onSubmit={handleResetPassword} noValidate>
          <h2>Set New Password</h2>
          <p className="fp-subtitle">Choose a strong password for your account.</p>

          <input
            id="new-password"
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
            className={error ? 'error' : ''}
            autoFocus
          />

          <input
            id="confirm-password"
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
            className={error ? 'error' : ''}
          />
          {error && <span className="error-text">⚠ {error}</span>}

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? 'RESETTING...' : 'RESET PASSWORD'}
          </button>
        </form>
      )}

      <button onClick={() => navigate('/login')} className="signup-btn">LOG IN</button>
    </div>
  );
};

export default ForgotPassword;
