import React, { useState, useEffect } from 'react';
import Sidebar from '../../Components/Sidebar/Sidebar';
import './Notes.css';
import Navbar from '../../Components/Navbar/Navbar';
import WelcomeBanner from '../../Components/WelcomeBanner/WelcomeBanner';
import NoteEditor from '../../Components/NoteEditor/NoteEditor';
import NotesGrid from '../../Components/NotesGrid/NotesGrid';

function Notes() {
  const [showEditor, setShowEditor] = useState(false);
  const [notes, setNotes] = useState([]);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [loadingNotes, setLoadingNotes] = useState(true);

  // Get JWT token from localStorage (or auth context)
  const token = localStorage.getItem('token');

  const handleOpenEditor = (noteId = null) => {
    setEditingNoteId(noteId);
    setShowEditor(true);
  };

  const handleCloseEditor = () => {
    setEditingNoteId(null);
    setShowEditor(false);
  };

  const handleDeleteNote = (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    fetch(`http://localhost:5000/api/notes/${noteId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (res.ok) {
          setNotes(prev => prev.filter(n => n._id !== noteId));
        } else {
          console.error('Failed to delete note');
        }
      })
      .catch(err => console.error(err));
  };

  const handleSaveNote = (noteData) => {
    setNotes(prevNotes => {
      const exists = prevNotes.find(n => n._id === noteData._id);
      if (exists) {
        return prevNotes.map(n =>
          n._id === noteData._id ? noteData : n
        );
      } else {
        return [...prevNotes, noteData];
      }
    });
    console.log('Note saved:', noteData);
    setShowEditor(false);
  };

  useEffect(() => {
    if (!token) return;

    setLoadingNotes(true);
    fetch('http://localhost:5000/api/notes', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setNotes(data.data || []); // depends on API response shape
      })
      .catch(err => {
        console.error('Error loading notes:', err);
      })
      .finally(() => setLoadingNotes(false));
  }, [token]); // load once when token is available

  return (
    <div className='notes-container'>
      <Sidebar />
      <div className="notes-content-wrapper">
        <Navbar />
        <main className="notes-main">
          {!showEditor ? (
            <>
              {/* Welcome Banner */}
              <div className='sf-welcome-header'>
                <WelcomeBanner
                  subtitle="Welcome To"
                  title="Your Personal Notes Hub"
                  description="Capture ideas, organize thoughts, and keep your learnings at your fingertips. Let's make note-taking smart and simple!"
                  buttonText="+ Add Notes"
                  onButtonClick={() => handleOpenEditor()}
                  animation="https://lottie.host/c58ecf00-c0e9-4cc8-b291-d975c0b400e2/vRICzcoj6o.lottie"
                />
              </div>

              {/* Notes Grid */}
              <NotesGrid
                notes={notes}
                loading={loadingNotes}
                onCardClick={(note) => handleOpenEditor(note._id)}
                onDeleteNote={handleDeleteNote}
              />
            </>
          ) : (
            <NoteEditor
              noteId={editingNoteId}
              userToken={token}
              onClose={handleCloseEditor}
              onSave={handleSaveNote}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default Notes;
