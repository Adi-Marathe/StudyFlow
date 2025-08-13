import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../Components/Sidebar/Sidebar';
import './Mindmaps.css';
import Navbar from '../../Components/Navbar/Navbar';
import WelcomeBanner from '../../Components/WelcomeBanner/WelcomeBanner';
import MindMapGrid from '../../Components/MindMapGrid/MindMapGrid';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

function Mindmaps() {
  const navigate = useNavigate();
  
  // State for managing mind maps
  const [mindMaps, setMindMaps] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMindMaps = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please log in to view mind maps');
        setLoading(false);
        return;
      }
  
      console.log('Making API request to backend...');
  
      // ✅ Use full URL instead of relative path
      const response = await fetch('http://localhost:5000/api/mindmaps', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
  
      // ✅ Check content type before parsing JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Non-JSON response received:', textResponse.substring(0, 200));
        throw new Error('Server returned HTML instead of JSON - check backend server');
      }
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Successfully fetched mind maps:', data);
      setMindMaps(data);
  
    } catch (error) {
      console.error('Error fetching mind maps:', error);
      toast.error(`Failed to load mind maps: ${error.message}`);
      setMindMaps([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load mind maps on component mount
  useEffect(() => {
    fetchMindMaps();
  }, [fetchMindMaps]);

  // Handle creating new mind map
  const handleCreateNewMindMap = () => {
    navigate("/mindmap-editor");
  };

  // Handle clicking on existing mind map card
  const handleCardClick = (mindMap) => {
    // ✅ Fixed: Remove escaped underscores
    navigate('/mindmap-editor', { 
      state: { 
        mindMapId: mindMap._id,  // ✅ Fixed
        title: mindMap.title,
        nodes: mindMap.nodes,
        edges: mindMap.edges
      }
    });
  };

  // ✅ Handle deleting mind map with backend API
  const handleDeleteMindMap = async (mindMapId) => {
    if (!window.confirm('Are you sure you want to delete this mind map?')) {
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please log in to delete mind maps');
        return;
      }
  
      // ✅ Fix: Use full backend URL instead of relative path
      const response = await fetch(`http://localhost:5000/api/mindmaps/${mindMapId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete mind map');
      }
  
      // Remove from state
      setMindMaps(prev => prev.filter(mindMap => mindMap._id !== mindMapId));
      
      toast.success('Mind map deleted successfully! 🗑️', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
  
    } catch (error) {
      console.error('Error deleting mind map:', error);
      toast.error('Failed to delete mind map');
    }
  };

  return (
    <>
      <div className='mindmaps-container'>
        <Sidebar />
        
        <div className="mindmaps-content-wrapper">
          <Navbar />
          <main className="mindmaps-main">
            <div>
              {/* Welcome Banner Section */}
              <div className='sf-welcome-header'>
                <WelcomeBanner
                  subtitle="Welcome To"
                  title="Your Mind Mapping Space"
                  description="Visualize your thoughts, connect ideas, and simplify complex topics. Let's make learning more creative and clear!"
                  buttonText="+ Create Mind Map"
                  onButtonClick={handleCreateNewMindMap}
                  animation="https://lottie.host/5e35d772-74dc-4f30-ad35-dab652f8cfed/5dYLPto9XZ.lottie"
                />
              </div>

              {/* Mind Maps Grid Section */}
              <div className='mindmaps-grid-section'>
                <MindMapGrid
                  mindMaps={mindMaps}
                  loading={loading}
                  onCardClick={handleCardClick}
                  onDeleteMindMap={handleDeleteMindMap}
                />
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default Mindmaps;
