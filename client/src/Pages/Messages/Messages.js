import react from 'react';
import Sidebar from '../../Components/Sidebar/Sidebar';
import './Messages.css';
import Navbar from '../../Components/Navbar/Navbar';

function Messages() {
    return(
        <>
         <div className='sf-messages-container'>
           <Sidebar/>
           <main className="sf-messages-main">
              <Navbar/>
              {/* ith tujha Welcome header display kar*/}
           </main> 
         </div>
        </>
    );
}

export default Messages;