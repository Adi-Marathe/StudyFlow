import react from 'react';
import Sidebar from '../../Components/Sidebar/Sidebar';
import './Mindmaps.css';
import Navbar from '../../Components/Navbar/Navbar';
import WelcomeBanner from '../../Components/WelcomeBanner/WelcomeBanner';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

function Mindmaps() {
    return(
        <>
          <div className='mindmaps-container'>
            <Sidebar/>             
           <main className="mindmaps-main">
              <Navbar/>
              <WelcomeBanner
              subtitle="Welcome To"
              title="Your Mind Mapping Space "
              description="Visualize your thoughts, connect ideas, and simplify complex topics. Let’s make learning more creative and clear!"
              buttonText="+ Create Mind Map"
              onButtonClick={() => console.log("Open Add Modal")}
              animation = "https://lottie.host/5e35d772-74dc-4f30-ad35-dab652f8cfed/5dYLPto9XZ.lottie"
              />
           </main> 
          </div>
        </>
    );
}

export default Mindmaps;