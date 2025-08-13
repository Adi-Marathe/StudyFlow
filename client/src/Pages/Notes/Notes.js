import React, { useState } from 'react';
import Sidebar from '../../Components/Sidebar/Sidebar';
import './Notes.css';
import Navbar from '../../Components/Navbar/Navbar';
import WelcomeBanner from '../../Components/WelcomeBanner/WelcomeBanner';
import NoteEditor from '../../Components/NoteEditor/NoteEditor';

function Notes(){
    const [showEditor, setShowEditor] = useState(false);
    const [notes, setNotes] = useState([]);

    const handleOpenEditor = () => {
        setShowEditor(true);
    };

    const handleCloseEditor = () => {
        setShowEditor(false);
    };

    const handleSaveNote = (noteData) => {
        setNotes(prevNotes => [...prevNotes, noteData]);
        console.log('Note saved:', noteData);
        setShowEditor(false); // Go back to main view after saving
    };

    return(
        <>
        <div className='notes-container'>
            <Sidebar />
            
            <div className="notes-content-wrapper">
                <Navbar />
                <main className="notes-main">
                    {!showEditor ? (
                        // Show welcome banner when not in editor mode
                        <div>
                            <div className='sf-welcome-header'>
                                <WelcomeBanner
                                    subtitle="Welcome To"
                                    title="Your Personal Notes Hub"
                                    description="Capture ideas, organize thoughts, and keep your learnings at your fingertips. Let's make note-taking smart and simple!"
                                    buttonText="+ Add Notes"
                                    onButtonClick={handleOpenEditor}
                                    animation="https://lottie.host/c58ecf00-c0e9-4cc8-b291-d975c0b400e2/vRICzcoj6o.lottie"
                                />
                            </div>
                        </div>
                    ) : (
                        // Show note editor when in editor mode
                        <NoteEditor
                            onClose={handleCloseEditor}
                            onSave={handleSaveNote}
                        />
                    )}
                </main>
            </div>
        </div>        
        </>
    )
}

export default Notes;
