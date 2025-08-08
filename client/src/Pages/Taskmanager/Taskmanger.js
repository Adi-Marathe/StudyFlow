import react from 'react';
import Sidebar from '../../Components/Sidebar/Sidebar';
import './Taskmanager.css';
import Navbar from '../../Components/Navbar/Navbar';
import WelcomeBanner from '../../Components/WelcomeBanner/WelcomeBanner';
import TaskStatsCards from '../../Components/TaskStatsCards/TaskStatsCards';

function Taskmanager() {
    return(
        <>
         <div className='taskmanager-container'>
            <Sidebar />
            
            <div className="taskmanager-content-wrapper">
              <Navbar />
              <main className="taskmanager-main">
                <div style={{ height: "2000px" }}>
                  <WelcomeBanner
                    subtitle="Welcome To"
                    title="Your Task Management Area "
                    description="Stay organized and in control. Let’s conquer your goals one task at a time!"
                    buttonText="+ Add Task"
                    onButtonClick={() => console.log("Open Add Task Modal")}
                    animation = "https://lottie.host/0faac7cd-d602-42ac-bdc4-0adc29ef53ea/vfOIsP34wi.lottie"
                  />
                  <TaskStatsCards/>
                </div>
              </main>
            </div>
          </div>
        </>
    );
}

export default Taskmanager;