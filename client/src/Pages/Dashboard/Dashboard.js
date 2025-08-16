import react from 'react';
import Sidebar from '../../Components/Sidebar/Sidebar'
import './Dashboard.css'
import Navbar from '../../Components/Navbar/Navbar';
import HomeHeader from '../../Components/HomeHeader/HomeHeader';
import Calendar from '../../Components/Calendar/Calendar';

function Dashboard(){
    return(
     <>
     <div className='dashboard-container'>
        <Sidebar/>
            <main className="dashboard-main">
                <Navbar/>
                <HomeHeader
                subtitle="Welcome Back"
                title="Aditya Marathe 👋"
                description="Stay in flow and trust the process, because every focused moment of study is building the success you’re striving for"
                animation = ""
                />
            </main>
            <Calendar/>
     </div>    
     </>
    );
}

export default Dashboard;