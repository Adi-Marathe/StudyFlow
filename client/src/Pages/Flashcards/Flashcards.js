import React from 'react';
import Sidebar from '../../Components/Sidebar/Sidebar';
import './Flashcards.css';
import Navbar from '../../Components/Navbar/Navbar';
import WelcomeBanner from '../../Components/WelcomeBanner/WelcomeBanner';

function Flashcards() {
    return (
    <div className='flashcards-container'>
      <Sidebar />
      
      <div className="flashcards-content-wrapper">
        <Navbar />
        <main className="flashcards-main">
          <div style={{ height: "2000px" }}>
            <div className='sf-welcome-header'>
              <WelcomeBanner
                  subtitle="Welcome To"
                  title="Your Flashcards Learning Hub"
                  description="Master concepts faster with quick reviews and smart recall. Let’s turn revision into a fun daily habit!"
                  buttonText="+ Add Flashcards"
                  onButtonClick={() => console.log("Open Task Modal")}
                //   animation="https://lottie.host/702419b2-3618-462f-8426-c6f1e65cbb22/wNiyt44PGI.lottie"
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Flashcards;

