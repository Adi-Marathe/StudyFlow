import react from 'react';
import Sidebar from '../../Components/Sidebar/Sidebar';
import './Taskmanager.css';
import Navbar from '../../Components/Navbar/Navbar';
import WelcomeBanner from '../../Components/WelcomeBanner/WelcomeBanner';

function Taskmanager() {
    return(
        <>
         <div className='taskmanager-container'>
           <Sidebar/>           
           <main className="taskmanager-main" style={{height : '2000px'}}>
              <Navbar/>
              <WelcomeBanner
              subtitle="Welcome To"
              title="Your Task Management Area "
              description="Stay organized and in control. Let’s conquer your goals one task at a time!"
              buttonText="+ Add Task"
              onButtonClick={() => console.log("Open Add Task Modal")}
              animation = "https://lottie.host/0faac7cd-d602-42ac-bdc4-0adc29ef53ea/vfOIsP34wi.lottie"
              />

              
           </main>
         </div>
        </>
    );
}

export default Taskmanager;