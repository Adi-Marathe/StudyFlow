import react from 'react';
import Sidebar from '../../Components/Sidebar/Sidebar';
import './Flashcards.css';
import Navbar from '../../Components/Navbar/Navbar';
import WelcomeBanner from '../../Components/WelcomeBanner/WelcomeBanner';

function Flashcards() {
    return(
        <>
          <div className='flashcards-container'>
           <Sidebar/>
           <main className="flashcards-main">
              <Navbar/>
              <WelcomeBanner
              subtitle="Welcome To"
              title="Your Flashcard Learning Hub"
              description="Master concepts faster with quick reviews and smart recall. Let’s turn revision into a fun daily habit!"
              buttonText="+ Add Flashcards"
              onButtonClick={() => console.log("Open Task Modal")}
              animation = "https://lottie.host/702419b2-3618-462f-8426-c6f1e65cbb22/wNiyt44PGI.lottie"
              />
           </main>             
        </div>
          
        </>
    );
}

export default Flashcards;