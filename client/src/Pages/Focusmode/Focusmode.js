import react from 'react';
import Sidebar from '../../Components/Sidebar/Sidebar';
import './Focusmode.css';
import Navbar from '../../Components/Navbar/Navbar';

function Focusmode() {
    return(
        <>
          <div className='focusmode-container'>
           <Sidebar/>
           <main className="focusmode-main">
              <Navbar/>
              {/* ith tujha Welcome header display kar*/}
           </main>  
         </div>
        </>
    );
}

export default Focusmode;