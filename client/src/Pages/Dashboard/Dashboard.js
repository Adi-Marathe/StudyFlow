import react from 'react';
import Sidebar from '../../Components/Sidebar/Sidebar'
import './Dashboard.css'
import Navbar from '../../Components/Navbar/Navbar';
import WelcomeBanner from '../../Components/WelcomeBanner/WelcomeBanner';

function Dashboard(){
    return(
     <>
     <div className='dashboard-container'>
        <Sidebar/>
            <main className="dashboard-main">
                <Navbar/>
                <WelcomeBanner
                subtitle="Welcome Back"
                title="Dashboard Overview"
                description="Track progress and manage your tasks efficiently."
                buttonText="+ New Task"
                onButtonClick={() => console.log("Open Add Task Modal")}
                animation = ""
                />
            </main>
     </div>    
     </>
    );
}

export default Dashboard;