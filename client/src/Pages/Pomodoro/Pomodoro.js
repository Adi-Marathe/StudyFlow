import React, { useState } from 'react';
import Sidebar from '../../Components/Sidebar/Sidebar';
import './Pomodoro.css';
import Navbar from '../../Components/Navbar/Navbar';
import WelcomeBanner from '../../Components/WelcomeBanner/WelcomeBanner';
import TimerModal from '../../Components/TimerModal/TimerModal';
import TimerSection from '../../Components/TimerSection/TimerSection';

function Pomodoro() {
  const [showModal, setShowModal] = useState(false);
  const [customTimer, setCustomTimer] = useState(null); 

  const handleApplyTimer = (selectedTime) => {
    setCustomTimer(selectedTime);     
    setShowModal(false);              
  };

  return (
    <div className='pomodoro-container'>
      <Sidebar />

      <div className="pomodoro-content-wrapper">
        <Navbar />
        <main className="pomodoro-main">
          <div className='sf-welcome-header'>
          <WelcomeBanner
            subtitle="Welcome To"
            title="Your Pomodoro Focus Zone"
            description="Big goals are achieved through small, focused sessions. One Pomodoro at a time."
            buttonText="+ Start Timer"
            onButtonClick={() => setShowModal(true)}
            animation="https://lottie.host/b77d9734-2bb2-4498-8b33-ab3e6031c489/pNu8gOmDjV.lottie"
          />
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
