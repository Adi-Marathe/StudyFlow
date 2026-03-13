import React, { useEffect, useState, useRef } from "react";
import "./TimerSection.css";

function TimerSection({ timerValues }) {
  const [mode, setMode] = useState("focus");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [rounds, setRounds] = useState(0);
  const [feedback, setFeedback] = useState("");

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
            alarmRef.current?.play();
            handleSessionComplete();
            setTimeout(handleAutoSwitch, 1800);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft]);

  const getModeTime = (mode) => {
    if (mode === "short") return timerValues?.shortBreak || 5;
    if (mode === "long") return timerValues?.longBreak || 15;
    return timerValues?.focusTime || 25;
  };

  const handleAutoSwitch = () => {
    if (mode === "focus") {
      const nextRound = rounds + 1;
      setRounds(nextRound);
      setMode(nextRound % 4 === 0 ? "long" : "short");
    } else {
      setMode("focus");
    }
  };

  const handleSessionComplete = () => {
    if (mode === "focus") setFeedback("Great focus! Take a break 🌿");
    if (mode === "short") setFeedback("Break done. Back to focus 🚀");
    if (mode === "long") setFeedback("You earned it. Let’s go again 💪");

    setTimeout(() => setFeedback(""), 2000);
  };

  const formatTime = () => {
    const h = Math.floor(secondsLeft / 3600);
    const m = Math.floor((secondsLeft % 3600) / 60);
    const s = secondsLeft % 60;

    if (h > 0) {
      return `${h.toString().padStart(2, "0")}:${m
        .toString()
        .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  };

  const handleReset = () => {
    const time = getModeTime(mode) * 60;
    setSecondsLeft(time);
    setIsRunning(false);
  };

  const progress =
    totalSecondsRef.current === 0
      ? 0
      : 100 - (secondsLeft / totalSecondsRef.current) * 100;

  return (
    <div className={`timer-container ${mode}`}>
      <audio ref={alarmRef} src="/sounds/alarm.wav" preload="auto" />

      <div className="water-fill" style={{ height: `${progress}%` }}>
        <div className="wave wave1"></div>
        <div className="wave wave2"></div>
      </div>

      {feedback && <div className="session-feedback">{feedback}</div>}

      {timerValues?.label && (
        <div className="preset-label">{timerValues.label}</div>
      )}

      <div className="timer-tabs">
        <button className={mode === "focus" ? "active" : ""} onClick={() => setMode("focus")}>Focus</button>
        <button className={mode === "short" ? "active" : ""} onClick={() => setMode("short")}>Short Break</button>
        <button className={mode === "long" ? "active" : ""} onClick={() => setMode("long")}>Long Break</button>
      </div>

      <div className="timer-display">{formatTime()}</div>

      <div className="timer-controls">
        <button className="primary-btn" onClick={() => setIsRunning(!isRunning)}>
          {isRunning ? "Pause" : "Start"}
        </button>
        <button className="secondary-btn" onClick={handleReset}>Reset</button>
      </div>

      <div className="round-counter">Round {rounds % 4}/4</div>
    </div>
  );
}

export default TimerSection;