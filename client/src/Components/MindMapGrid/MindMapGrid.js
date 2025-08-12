import React from 'react';
import './MindMapGrid.css';

const MindMapGrid = ({ mindMaps, loading, onCardClick, onDeleteMindMap }) => {
  const handleCardClick = (mindMap) => {
    onCardClick(mindMap);
  };

  const handleDeleteClick = (e, mindMapId) => {
    e.stopPropagation(); // Prevent card click when delete is clicked
    onDeleteMindMap(mindMapId);
  };

  const renderMindMapPreview = (mindMap) => {
    // Handle both legacy data structure and new backend structure
    const nodes = mindMap.nodes || [];
    
    return (
      <div className="mindmap-preview">
        <div className="preview-nodes">
          {nodes.slice(0, 4).map((node, index) => (
            <div 
              key={node.id || index} 
              className="preview-node"
              style={{
                backgroundColor: node.data?.color || '#701ad9',
                transform: `translate(${(index % 2) * 30}px, ${Math.floor(index / 2) * 25}px)`
              }}
            >
              {/* Handle both data structures */}
              {node.data?.label || node.title || 'Node'}
            </div>
          ))}
          {nodes.length > 4 && (
            <div className="preview-node more-nodes">
              +{nodes.length - 4}
            </div>
          )}
          {nodes.length === 0 && (
            <div className="preview-empty">
              <span>Empty Mind Map</span>
            </div>
          )}
        </div>
        
        {/* Add connecting lines for visual appeal */}
        {nodes.length > 1 && (
          <div className="preview-connections">
            <div className="connection-line line-1"></div>
            <div className="connection-line line-2"></div>
          </div>
        )}
      </div>
    );
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

  // Show loading state
  if (loading) {
    return (
      <div className="mindmap-grid-container">
        <div className="mindmap-grid-header">
          <h2>Mind Maps</h2>
        </div>
        <div className="loading-state">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
          <p>Loading your mind maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mindmap-grid-container">
      <div className="mindmap-grid-header">
        <h2>Your Mind Maps</h2>
      </div>
      
      <div className="mindmap-grid">
        {mindMaps.map((mindMap) => (
          <div 
            key={mindMap._id || mindMap.id} // ✅ Fixed: Handle both _id and id
            className="mindmap-card"
            onClick={() => handleCardClick(mindMap)}
          >
            <div className="mindmap-card-content">
              {/* Card Header with Delete Button */}
              <div className="mindmap-card-header">
                <button 
                  className="delete-btn"
                  onClick={(e) => handleDeleteClick(e, mindMap._id || mindMap.id)} // ✅ Fixed
                  title="Delete mind map"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3,6 5,6 21,6"></polyline>
                    <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </div>

              {/* Preview Area */}
              <div className="mindmap-preview-container">
                {renderMindMapPreview(mindMap)}
                
                {/* Hover Overlay */}
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
              
              {/* Title and Meta Info */}
              <div className="mindmap-info">
                <div className="mindmap-title">
                  {mindMap.title || 'Untitled Mind Map'}
                </div>
                
                <div className="mindmap-meta">
                  <span className="nodes-count">
                    {mindMap.nodes?.length || 0} nodes
                  </span>
                  <span className="created-date">
                    {formatDate(mindMap.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Card Hover Effect */}
            <div className="card-hover-overlay">
              {/* <div className="hover-actions">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                <span>Edit Mind Map</span>
              </div> */}
            </div>
          </div>
        ))}
        
        {/* Empty state */}
        {mindMaps.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-content">
              <div className="empty-icon">🧠</div>
              <h3>No Mind Maps Yet</h3>
              <p>Create your first mind map to visualize your thoughts and ideas!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MindMapGrid;
