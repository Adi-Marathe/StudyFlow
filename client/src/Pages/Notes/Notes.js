import react from 'react';
import Sidebar from '../../Components/Sidebar/Sidebar';
import './Notes.css';
import Navbar from '../../Components/Navbar/Navbar';
import WelcomeBanner from '../../Components/WelcomeBanner/WelcomeBanner';

function Notes(){
    return(
        <>
        <div className='notes-container'>
            <Sidebar/>
           <main className="notes-main">
              <Navbar/>
              <WelcomeBanner
              subtitle="Welcome Back"
              title="Your Personal Notes Hub"
              description="Capture ideas, organize thoughts, and keep your learnings at your fingertips. Let’s make note-taking smart and simple!"
              buttonText="+ Add Notes"
              onButtonClick={() => console.log("Open Task Modal")}
              animation = "https://lottie.host/c58ecf00-c0e9-4cc8-b291-d975c0b400e2/vRICzcoj6o.lottie"
              />
           </main> 
        </div>
        </>
    )
}

export default Notes;

