import React, { useState, useEffect } from "react";
import Sidebar from "../../Components/Sidebar/Sidebar";
import "./Pomodoro.css";
import Navbar from "../../Components/Navbar/Navbar";
import WelcomeBanner from "../../Components/WelcomeBanner/WelcomeBanner";
import TimerModal from "../../Components/TimerModal/TimerModal";
import TimerSection from "../../Components/TimerSection/TimerSection";
import PresetTimers from "../../Components/PresetTimers/PresetTimers";
import axios from "axios";

function Pomodoro() {
  const [showModal, setShowModal] = useState(false);
  const [customTimer, setCustomTimer] = useState(null);
  const [presetTimers, setPresetTimers] = useState([]);

  // 🔥 STEP 1: LOAD FROM DATABASE (ON REFRESH)
  useEffect(() => {
    fetchPresets();
  }, []);

  const fetchPresets = async () => {
    try {
      const res = await axios.get("${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/timers");
      setPresetTimers(res.data);
    } catch (err) {
      console.error("Error fetching presets", err);
    }
  };

  // 🔥 STEP 2: SAVE TO DATABASE
  const handleApplyTimer = async (newTimer) => {
    try {
      const res = await axios.post(
        "${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/timers",
        newTimer
      );

      setPresetTimers((prev) => [res.data, ...prev]);
      setCustomTimer(res.data);
      setShowModal(false);
    } catch (err) {
      console.error("Error saving preset", err);
    }
  };

  // 🔥 STEP 3: DELETE FROM DATABASE
  const handleDeletePreset = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/timers/${id}`);
      setPresetTimers((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Error deleting preset", err);
    }
  };

  return (
    <div className="pomodoro-container">
      <Sidebar />
      <div className="pomodoro-content-wrapper">
        <Navbar />

        <main className="pomodoro-main">
          <div className="top-row">
            <div className="welcome-left">
              <WelcomeBanner
                subtitle="Welcome To"
                title="Your Pomodoro Focus Zone"
                description="Big goals are achieved through small, focused sessions."
                buttonText="+ Start Timer"
                onButtonClick={() => setShowModal(true)}
              />
            </div>

            <div className="preset-right">
              <PresetTimers
                timers={presetTimers}
                onSelect={setCustomTimer}
                onDelete={handleDeletePreset}
              />
            </div>
          </div>

          {showModal && (
            <TimerModal
              onClose={() => setShowModal(false)}
              onApply={handleApplyTimer}
            />
          )}

          <TimerSection timerValues={customTimer} />
        </main>
      </div>
    </div>
  );
}

export default Pomodoro;