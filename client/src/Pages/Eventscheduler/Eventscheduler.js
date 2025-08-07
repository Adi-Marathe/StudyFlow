import React from 'react';
import Sidebar from '../../Components/Sidebar/Sidebar';
import './Eventscheduler.css';
import Navbar from '../../Components/Navbar/Navbar';
import WelcomeBanner from '../../Components/WelcomeBanner/WelcomeBanner';

function Eventschedular() {
  return (
    <div className='eventscheduler-container'>
      <Sidebar />
      
      <div className="eventscheduler-content-wrapper">
        <Navbar />
        <main className="eventscheduler-main">
          <div style={{ height: "2000px" }}>
            <WelcomeBanner
              subtitle="Welcome To"
              title="Your Event Scheduler"
              description="Stay on track and never miss a moment. Let's plan your events with ease and keep your days smooth and sorted!"
              buttonText="+ Add Event"
              onButtonClick={() => console.log("Open Add Modal")}
              animation="https://lottie.host/12047cbf-ae5e-42c1-8fc7-edff6e6eaa4f/jTKxWt1KmD.lottie"
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Eventschedular;
