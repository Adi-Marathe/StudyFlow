import React from 'react';
import './FlashcardSet.css';

function FlashcardSet({
  title,
  description,
  cards = [],
  createdAt,
  onEdit,
  onDelete,
  onView
}) {
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    onEdit?.();
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete?.();
  };

  const previewCards = cards.slice(0, 3);

  return (
    <div className="flashcard-set" onClick={onView}>
      <div className="flashcard-set-content">
        <div className="flashcard-set-header">
          <button className="icon-btn edit-btn" onClick={handleEditClick} title="Edit flashcard set">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4z"></path>
            </svg>
          </button>
          <button className="icon-btn delete-btn" onClick={handleDeleteClick} title="Delete flashcard set">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3,6 5,6 21,6"></polyline>
              <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>

        <div className="flashcard-preview-container">
          <div className="flashcard-preview">
            {cards.length === 0 ? (
              <div className="preview-empty">
                <span>Empty Flashcard Set</span>
              </div>
            ) : (
              <div className="preview-stack">
                {previewCards.map((card, index) => (
                  <div
                    key={`${card.question || 'card'}-${index}`}
                    className="preview-mini-flashcard"
                    style={{
                      transform: `translate(${index * 14}px, ${index * 8}px) rotate(${index === 1 ? -3 : index === 2 ? 2 : 0}deg)`,
                      zIndex: previewCards.length - index
                    }}
                  >
                    <span className="mini-card-tag">Q</span>
                    <p className="mini-card-question">{card.question || `Card ${index + 1}`}</p>
                    <p className="mini-card-answer">{card.answer || 'Tap to study'}</p>
                  </div>
                ))}
                {cards.length > 3 && (
                  <div className="preview-more-cards">+{cards.length - 3}</div>
                )}
              </div>
            )}
          </div>

          <div className="preview-overlay">
            <div className="overlay-content">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <span>Click to open</span>
            </div>
          </div>
        </div>

        <div className="flashcard-info">
          <div className="flashcard-title">{title || 'Untitled Flashcard Set'}</div>
          <p className="flashcard-description">{description || 'No description added yet.'}</p>
          <div className="flashcard-meta">
            <span className="cards-count">{cards.length} cards</span>
            <span className="created-date">{formatDate(createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="card-hover-overlay"></div>
    </div>
  );
}

export default FlashcardSet;

