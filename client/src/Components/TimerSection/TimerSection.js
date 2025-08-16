import React, { useEffect, useState, useRef } from 'react';
import './TimerSection.css';

function TimerSection({ timerValues }) {
  const [mode, setMode] = useState('focus');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [rounds, setRounds] = useState(0);
  const circleRef = useRef(null);
  const totalSecondsRef = useRef(0);
  const alarmRef = useRef(null);

  useEffect(() => {
    const time = getModeTime(mode) * 60;
    totalSecondsRef.current = time;
    setSecondsLeft(time);
    setIsRunning(false);
  }, [mode, timerValues]);

  useEffect(() => {
    let interval;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsRunning(false);
            if (alarmRef.current) {
              alarmRef.current.play();
            }
            setTimeout(() => handleAutoSwitch(), 2000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft]);

  const getModeTime = (mode) => {
    switch (mode) {
      case 'short': return timerValues?.shortBreak || 5;
      case 'long': return timerValues?.longBreak || 15;
      default: return timerValues?.focusTime || 25;
    }
  };

  const handleAutoSwitch = () => {
    if (mode === 'focus') {
      const nextRound = rounds + 1;
      setRounds(nextRound);
      if (nextRound % 4 === 0) {
        setMode('long');
      } else {
        setMode('short');
      }
    } else {
      setMode('focus');
    }
  };

  const formatTime = () => {
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleReset = () => {
    const time = getModeTime(mode) * 60;
    setSecondsLeft(time);
    setIsRunning(false);
  };

  const progress = 100 - (secondsLeft / totalSecondsRef.current) * 100;

  return (
    <div className="timer-container">
      <audio ref={alarmRef} src="/sounds/alarm.wav" preload="auto" />

      {/* ✅ Only show label if it exists */}
      {timerValues?.label && (
        <h2 className="current-label">{timerValues.label}</h2>
      )}

      <div className="timer-tabs">
        <button className={mode === 'focus' ? 'active' : ''} onClick={() => setMode('focus')}>Focus</button>
        <button className={mode === 'short' ? 'active' : ''} onClick={() => setMode('short')}>Short Break</button>
        <button className={mode === 'long' ? 'active' : ''} onClick={() => setMode('long')}>Long Break</button>
      </div>

      <div className="timer-main">
        <div className="progress-ring">
          <svg className="progress-circle" width="260" height="260">
            <circle className="bg-circle" cx="130" cy="130" r="115" strokeWidth="12" />
            <circle
              className="fg-circle"
              cx="130"
              cy="130"
              r="115"
              strokeWidth="12"
              strokeDasharray={2 * Math.PI * 115}
              strokeDashoffset={(2 * Math.PI * 115 * progress) / 100}
              ref={circleRef}
            />
          </svg>
          <div className="timer-display">{formatTime()}</div>
        </div>

        <div className="timer-controls">
          <button className="start-btn" onClick={() => setIsRunning(!isRunning)}>
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <button className="reset-btn" onClick={handleReset}>Reset</button>
        </div>

        <div className="round-counter">Round: {rounds % 4}/4</div>
      </div>
    </div>
  );
}

export default TimerSection;
