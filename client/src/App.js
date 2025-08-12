import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landingpage from './Pages/Landingpage/Landingpage';
import Login from './Pages/Auth/Login';
import Signup from './Pages/Auth/Signup'
import Dashboard from './Pages/Dashboard/Dashboard';
import { ToastContainer } from 'react-toastify';
import PrivateRoute from './routes/PrivateRoute';
import Chatbot from './Pages/Chatbot/Chatbot';
import Eventscheduler from './Pages/Eventscheduler/Eventscheduler';
import Mindmaps from './Pages/Mindmaps/Mindmaps';
import MindMapEditor from './Components/MindMapEditor/MindMapEditor';
import Flashcards from './Pages/Flashcards/Flashcards';
import Pomodoro from './Pages/Pomodoro/Pomodoro';
import Messages from './Pages/Messages/Messages';
import Taskmanager from './Pages/Taskmanager/Taskmanager';
import Focusmode from './Pages/Focusmode/Focusmode';
import Notes from './Pages/Notes/Notes';
import { DarkModeProvider } from './context/DarkModeContext';
import './App.css';

function App() {
  return (
    <DarkModeProvider>
            <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} toastClassName="custom-toast" />
        <Routes>
          <Route path="/" element={<Landingpage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Signup />} />
          <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

          <Route path="/chatbot" element={<Chatbot/>}/>
          <Route path="/eventscheduler" element={<Eventscheduler/>}/>
          <Route path="/flashcards" element={<Flashcards/>}/>
          <Route path="/focusmode" element={<Focusmode/>}/>
          <Route path="/mindmaps" element={<Mindmaps/>}/>
          <Route path="/mindmaped" element={<MindMapEditor />} />
          <Route path="/pomodoro" element={<Pomodoro/>}/>
          <Route path="/taskmanager" element={<Taskmanager/>}/>
          <Route path="/notes" element={<Notes/>}/>
          <Route path="/messages" element={<Messages/>}/>
        </Routes>
        
      </BrowserRouter>
    </DarkModeProvider>
  );
}

export default App;
