import React from 'react';
import './NotesGrid.css'; // You can reuse most of MindMapGrid.css

const NotesGrid = ({ notes, loading, onCardClick, onDeleteNote }) => {
  const handleCardClick = (note) => {
    onCardClick(note);
  };

  const handleDeleteClick = (e, noteId) => {
    e.stopPropagation(); // Prevent opening note on delete click
    onDeleteNote(noteId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderNotePreview = (note) => {
    if (!note.pages || note.pages.length === 0) {
      return <div className="preview-empty"><span>No Content</span></div>;
    }
    const firstPage = note.pages[0];
    const plainText = firstPage.content
      ? firstPage.content.replace(/<[^>]+>/g, '') // strip HTML tags
      : '';
    const snippet = plainText.length > 120
      ? plainText.slice(0, 120) + '…'
      : plainText;

    return (
      <div className="note-preview">
        {snippet || <em>Empty Page</em>}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="notes-grid-container">
        <div className="notes-grid-header">
          <h2>Your Notes</h2>
        </div>
        <div className="loading-state">
          <div className="loading-spinner"><div className="spinner"></div></div>
          <p>Loading your notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notes-grid-container">
      <div className="notes-grid-header">
        <h2>Your Notes</h2>
      </div>
      <div className="notes-grid">
        {notes.map((note) => (
          <div
            key={note._id || note.id}
            className="note-card"
            onClick={() => handleCardClick(note)}
          >
            <div className="note-card-content">
              {/* Header with Delete */}
              <div className="note-card-header">
                <button
                  className="delete-btn"
                  onClick={(e) => handleDeleteClick(e, note._id || note.id)}
                  title="Delete note"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2">
                    <polyline points="3,6 5,6 21,6"></polyline>
                    <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </div>

              {/* Preview Area */}
              <div className="note-preview-container">
                {renderNotePreview(note)}
                <div className="preview-overlay">
                  <div className="overlay-content">
                    <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    <span>Click to open</span>
                  </div>
                </div>
              </div>

              {/* Title & Meta */}
              <div className="note-info">
                <div className="note-title">
                  {note.fileName || note.title || 'Untitled Note'}
                </div>
                <div className="note-meta">
                  <span className="pages-count">
                    {note.pages?.length || 0} pages
                  </span>
                  <span className="updated-date">
                    {formatDate(note.updatedAt || note.lastModified)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Empty state */}
        {notes.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-content">
              <h3>No Notes Yet</h3>
              <p>Create your first note to start capturing ideas!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesGrid;
