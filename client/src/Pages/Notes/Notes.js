import react from 'react';
import Sidebar from '../../Components/Sidebar/Sidebar';
import './Notes.css';
import Navbar from '../../Components/Navbar/Navbar';
import WelcomeBanner from '../../Components/WelcomeBanner/WelcomeBanner';

function Notes(){
    return(
        <>
        <div className='notes-container'>
        <Sidebar />
        
        <div className="notes-content-wrapper">
            <Navbar />
            <main className="notes-main">
            <div style={{ height: "2000px" }}>
            <div className='sf-welcome-header'>
                <WelcomeBanner
                subtitle="Welcome To"
                title="Your Personal Notes Hub"
                description="Capture ideas, organize thoughts, and keep your learnings at your fingertips. Let’s make note-taking smart and simple!"
                buttonText="+ Add Notes"
                onButtonClick={() => console.log("Open Add Modal")}
                animation="https://lottie.host/c58ecf00-c0e9-4cc8-b291-d975c0b400e2/vRICzcoj6o.lottie"
                />
            </div>
            </div>
            </main>
        </div>
        </div>        
        </>
    )
}

export default Notes;

