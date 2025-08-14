import react from 'react';
import Sidebar from '../../Components/Sidebar/Sidebar';
import './Pomodoro.css';
import Navbar from '../../Components/Navbar/Navbar';
import WelcomeBanner from '../../Components/WelcomeBanner/WelcomeBanner';

function Pomodoro() {
    return (
      <div className='pomodoro-container'>
        <Sidebar />
        
        <div className="pomodoro-content-wrapper">
          <Navbar />
          <main className="pomodoro-main">
            <div style={{ height: "2000px" }}>
              <div className='sf-welcome-header'>
                <WelcomeBanner
                subtitle="Welcome To"
                title="Your Pomodoro Focus Zone "
                description="Boost your productivity with focused sprints and refreshing breaks. Let’s conquer distractions—one Pomodoro at a time!"
                buttonText="+ Start Timer"
                onButtonClick={() => console.log("Open Add Modal")}
                animation = "https://lottie.host/b77d9734-2bb2-4498-8b33-ab3e6031c489/pNu8gOmDjV.lottie"
                />
              </div>
            </div>
          </main>
        </div>
      </div>
    );
}

export default Pomodoro;

