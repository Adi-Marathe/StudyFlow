import React, { useState } from 'react';
import Sidebar from '../../Components/Sidebar/Sidebar';
import './Focusmode.css';
import Navbar from '../../Components/Navbar/Navbar';
import WelcomeBanner from '../../Components/WelcomeBanner/WelcomeBanner';
import FocusDashboard from '../../Components/FocusDashboard/FocusDashboard';
import MotivationalQuote from '../../Components/MotivationalQuote/MotivationalQuote';
import FocusSession from '../../Components/FocusSession/FocusSession';
import TaskSelectModal from '../../Components/TaskSelectModal/TaskSelectModal';

function Focusmode() {
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionData, setSessionData]     = useState({});
  const [modalOpen, setModalOpen]         = useState(false);
  const [refreshKey, setRefreshKey]       = useState(0);

  // Called by WelcomeBanner button → open modal to pick a task
  const handleBannerClick = () => {
    setModalOpen(true);
  };

  // Called by modal "Start Focus" → launch session with task info
  const handleModalStart = (data) => {
    setSessionData(data);
    setSessionActive(true);
  };

  // Called by FocusDashboard Quick Start button → launch session directly (no modal)
  const handleQuickStart = (data) => {
    setSessionData(data);
    setSessionActive(true);
  };

  const handleExitSession = () => {
    setSessionActive(false);
    setSessionData({});
    // Small delay so backend abandon/complete call finishes before dashboard re-fetches
    setTimeout(() => setRefreshKey(k => k + 1), 800);
  };

  return (
    <>
      {/* Task selection modal — shown when clicking WelcomeBanner button */}
      <TaskSelectModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onStart={handleModalStart}
      />

      {/* Full-screen focus overlay */}
      {sessionActive && (
        <FocusSession
          focusIntent={sessionData.focusIntent || ''}
          taskId={sessionData.taskId || null}
          taskTitle={sessionData.taskTitle || null}
          onExit={handleExitSession}
          onSessionComplete={() => setRefreshKey(k => k + 1)}
        />
      )}

      <div className='flashcard-container'>
        <Sidebar />
        <div className="flashcard-content-wrapper">
          <Navbar />
          <main className="flashcard-main">
            <div>
              <div className='sf-top-row'>
                <div className='sf-welcome-header'>
                  <WelcomeBanner
                    subtitle="Welcome To"
                    title="Your Focus Space"
                    description="Eliminate distractions, stay consistent, and get meaningful work done with structured focus sessions."
                    buttonText="+ Start Focus Session"
                    onButtonClick={handleBannerClick}
                    animation="https://lottie.host/5e35d772-74dc-4f30-ad35-dab652f8cfed/5dYLPto9XZ.lottie"
                  />
                </div>
                <div className='sf-quote-panel'>
                  <MotivationalQuote />
                </div>
              </div>

              <FocusDashboard onStartSession={handleQuickStart} refreshKey={refreshKey} />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default Focusmode;