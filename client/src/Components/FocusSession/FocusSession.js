import React, { useState, useEffect, useRef, useCallback } from 'react';
import './FocusSession.css';
import alarmSound from '../../Assets/alarm.wav';

const FOCUS_DURATION = 25 * 60;
const BREAK_DURATION = 5 * 60;

const AMBIENCE = [
  { id: 'rain',  label: 'RAIN',  icon: '🌧️' },
  { id: 'lofi',  label: 'LO-FI', icon: '🎧' },
  { id: 'noise', label: 'NOISE', icon: '〰️' },
];

function FocusSession({ focusIntent, taskId, taskTitle, onExit, onSessionComplete }) {
  const [secondsLeft, setSecondsLeft]       = useState(FOCUS_DURATION);
  const [isRunning, setIsRunning]           = useState(true);
  const [phase, setPhase]                   = useState('focus');
  const [sessionsCount, setSessionsCount]   = useState(0);
  const [activeAmbience, setActiveAmbience] = useState(null);
  const [showComplete, setShowComplete]     = useState(false);
  const [toastMsg, setToastMsg]             = useState('');

  const timerRef     = useRef(null);
  const alarmRef     = useRef(new Audio(alarmSound));
  const wakeLockRef  = useRef(null);
  const sessionIdRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  // Stable refs so callbacks don't need them as deps
  const focusIntentRef = useRef(focusIntent);
  const taskIdRef      = useRef(taskId);
  const tokenRef       = useRef(localStorage.getItem('token'));

  const totalDuration    = phase === 'focus' ? FOCUS_DURATION : BREAK_DURATION;
  const progress         = ((totalDuration - secondsLeft) / totalDuration) * 100;
  const R                = 130;
  const C                = 2 * Math.PI * R;
  const strokeDashoffset = C - (progress / 100) * C;

  const getHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${tokenRef.current}`,
  }), []);

  const getElapsed = useCallback(
    () => Math.round((Date.now() - startTimeRef.current) / 1000),
    []
  );

  const createSession = useCallback(async () => {
    try {
      const res = await fetch('${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/focus', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          focusIntent: focusIntentRef.current,
          taskId: taskIdRef.current || undefined,
          duration: FOCUS_DURATION,
        }),
      });
      const data = await res.json();
      if (data.success) sessionIdRef.current = data.session._id;
    } catch (e) {
      console.error('Failed to create focus session:', e);
    }
  }, [getHeaders]);

  // Create session on mount
  useEffect(() => {
    createSession();
    startTimeRef.current = Date.now();
  }, [createSession]);

  // Fullscreen
  useEffect(() => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    return () => {
      if (document.fullscreenElement && document.exitFullscreen)
        document.exitFullscreen().catch(() => {});
    };
  }, []);

  // Wake Lock
  useEffect(() => {
    if ('wakeLock' in navigator) {
      navigator.wakeLock.request('screen')
        .then(wl => { wakeLockRef.current = wl; })
        .catch(() => {});
    }
    return () => { wakeLockRef.current?.release(); };
  }, []);

  // Suppress notifications
  useEffect(() => {
    const Orig = window.Notification;
    window.Notification = function () {};
    window.Notification.requestPermission = Orig.requestPermission?.bind(Orig);
    window.Notification.permission = Orig.permission;
    return () => { window.Notification = Orig; };
  }, []);

  const completeOnBackend = useCallback(async (status = 'completed') => {
    if (!sessionIdRef.current) return;
    try {
      await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/focus/${sessionIdRef.current}/complete`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ actualDuration: getElapsed(), status }),
      });
    } catch (e) {
      console.error('Failed to complete session:', e);
    }
  }, [getHeaders, getElapsed]);

  const handleSessionComplete = useCallback(async () => {
    alarmRef.current.currentTime = 0;
    alarmRef.current.play().catch(() => {});

    if (phase === 'focus') {
      await completeOnBackend('completed');
      setSessionsCount(c => c + 1);
      if (onSessionComplete) setTimeout(onSessionComplete, 500); // refresh dashboard stats
      setToastMsg('🎉 Focus complete! Time for a break.');
      setPhase('break');
      setSecondsLeft(BREAK_DURATION);
    } else {
      setToastMsg('⚡ Break over. Back to work!');
      setPhase('focus');
      setSecondsLeft(FOCUS_DURATION);
      // Create new backend session for next focus block
      await createSession();
    }

    setShowComplete(true);
    setTimeout(() => setShowComplete(false), 3000);
    setIsRunning(false);
    startTimeRef.current = Date.now();
  }, [phase, completeOnBackend, createSession, onSessionComplete]);

  // Countdown timer
  useEffect(() => {
    if (!isRunning) return;
    timerRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          handleSessionComplete();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [isRunning, handleSessionComplete]);

  const togglePause = () => setIsRunning(r => !r);

  const handleReset = () => {
    clearInterval(timerRef.current);
    setIsRunning(false);
    setSecondsLeft(phase === 'focus' ? FOCUS_DURATION : BREAK_DURATION);
    startTimeRef.current = Date.now();
  };

  const handleSkip = useCallback(() => {
    clearInterval(timerRef.current);
    completeOnBackend('skipped');
    if (phase === 'focus') {
      setPhase('break');
      setSecondsLeft(BREAK_DURATION);
    } else {
      setPhase('focus');
      setSecondsLeft(FOCUS_DURATION);
    }
    setIsRunning(true);
    startTimeRef.current = Date.now();
  }, [phase, completeOnBackend]);

  const handleExit = useCallback(async () => {
    clearInterval(timerRef.current);
    if (phase === 'focus' && sessionIdRef.current) {
      try {
        await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/focus/${sessionIdRef.current}/abandon`, {
          method: 'PATCH',
          headers: getHeaders(),
          body: JSON.stringify({ actualDuration: getElapsed() }),
        });
      } catch (e) {}
    }
    onExit();
  }, [phase, getHeaders, getElapsed, onExit]);

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');
  const displayTitle = focusIntent || taskTitle || 'Deep Focus Session';

  return (
    <div className="fs-overlay">
      <div className="fs-bg">
        <div className="fs-orb fs-orb--1" />
        <div className="fs-orb fs-orb--2" />
        <div className="fs-orb fs-orb--3" />
      </div>

      {showComplete && <div className="fs-complete-toast">{toastMsg}</div>}

      <div className="fs-header">
        <p className="fs-phase-label">
          {phase === 'focus' ? 'CURRENTLY FOCUSING ON' : 'BREAK TIME'}
        </p>
        <h1 className="fs-intent-title">{displayTitle}</h1>
        <div className="fs-session-badges">
          <span className={`fs-badge ${phase === 'focus' ? 'fs-badge--active' : ''}`}>Focus</span>
          <span className={`fs-badge ${phase === 'break' ? 'fs-badge--active' : ''}`}>Break</span>
          <span className="fs-badge fs-badge--count">
            {sessionsCount} session{sessionsCount !== 1 ? 's' : ''} done
          </span>
        </div>
      </div>

      <div className="fs-timer-wrap">
        <svg className="fs-ring" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
              <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          <circle cx="150" cy="150" r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
          <circle
            cx="150" cy="150" r={R} fill="none"
            stroke={phase === 'focus' ? '#f97316' : '#a78bfa'}
            strokeWidth="10" strokeLinecap="round"
            strokeDasharray={C} strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 150 150)" filter="url(#glow)"
            className="fs-progress-arc"
          />
        </svg>
        <div className="fs-timer-inner">
          <div className={`fs-time-display ${!isRunning ? 'fs-time-display--paused' : ''}`}>
            {mins}:{secs}
          </div>
          <p className="fs-phase-tag">{phase === 'focus' ? 'DEEP FOCUS SESSION' : 'BREAK SESSION'}</p>
        </div>
      </div>

      <div className="fs-controls">
        <button className="fs-ctrl-btn fs-ctrl-btn--ghost" onClick={handleReset} title="Reset">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="1 4 1 10 7 10"/>
            <path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
          </svg>
        </button>
        <button
          className={`fs-ctrl-btn fs-ctrl-btn--primary ${!isRunning ? 'fs-ctrl-btn--play' : ''}`}
          onClick={togglePause}
        >
          {isRunning ? (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1"/>
              <rect x="14" y="4" width="4" height="16" rx="1"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,3 19,12 5,21"/>
            </svg>
          )}
        </button>
        <button className="fs-ctrl-btn fs-ctrl-btn--ghost" onClick={handleSkip} title="Skip">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5,4 15,12 5,20"/>
            <rect x="17" y="4" width="2" height="16" rx="1"/>
          </svg>
        </button>
      </div>

      <div className="fs-ambience">
        {AMBIENCE.map(({ id, label, icon }) => (
          <button
            key={id}
            className={`fs-amb-btn ${activeAmbience === id ? 'fs-amb-btn--active' : ''}`}
            onClick={() => setActiveAmbience(a => a === id ? null : id)}
          >
            <span className="fs-amb-icon">{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      <button className="fs-exit-btn" onClick={handleExit}>
        EXIT FOCUS MODE
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"/>
          <polyline points="12 5 19 12 12 19"/>
        </svg>
      </button>
    </div>
  );
}

export default FocusSession;