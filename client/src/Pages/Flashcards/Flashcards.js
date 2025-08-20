import React, { useState, useEffect } from 'react';
import Sidebar from '../../Components/Sidebar/Sidebar';
import './Flashcards.css';
import Navbar from '../../Components/Navbar/Navbar';
import WelcomeBanner from '../../Components/WelcomeBanner/WelcomeBanner';
import LearningHeader from '../../Components/LT Header/LearningHeader';
import CreateFlashcard from '../../Components/CreateFlashcard/CreateFlashcard';
import EditFlashcard from '../../Components/EditFlashcard/EditFlashcard';
import FlashcardSet from '../../Components/FlashcardSet/FlashcardSet';
import ViewFlashcards from '../../Components/ViewFlashcards/ViewFlashcards';

function Flashcards() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [flashCardSets, setFlashCardSets] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedSet, setSelectedSet] = useState(null);


  const fetchSets = () => {
    fetch('http://localhost:5000/api/flashcards', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setFlashCardSets(data);
        } else {
          console.error('Unexpected API response:', data);
          setFlashCardSets([]);
        }
      })
      .catch(err => {
        console.error('Error fetching flashcards:', err);
        setFlashCardSets([]);
      });
  }

  // Fetch flashcards on mount
  useEffect(() => {
    fetchSets();
  }, []);

  // Add flashcard set (Create)
  const handleSaveSet = async (newSet) => {
    try {
      const res = await fetch('http://localhost:5000/api/flashcards', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        // body: JSON.stringify(newSet)
      });
      fetchSets();

      const savedSet = await res.json();
      if (!res.ok) throw new Error(savedSet.error || "Failed to save flashcard set");

      setFlashCardSets((prev) => [...prev, savedSet]);
    } catch (err) {
      console.error(err);
    }
  };

  // Update flashcard set (Edit)
  const handleUpdateSet = async (updatedSet) => {
    try {
      const setId = flashCardSets[editIndex]?._id;
      if (!setId) return;

      const res = await fetch(`http://localhost:5000/api/flashcards/${setId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(updatedSet)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update flashcard set");

      setFlashCardSets((prev) =>
        prev.map((set, i) => (i === editIndex ? data : set))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Delete flashcard set
  const handleDeleteFlashcardSet = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/flashcards/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (!res.ok) throw new Error("Failed to delete flashcard set");

      setFlashCardSets((prev) => prev.filter((set) => set._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddFlashcardSet = () => {
    setIsCreateOpen(true);
  };

  const handleEditFlashcardSet = (index) => {
    setEditIndex(index);
    setIsEditOpen(true);
  };

  const handleViewFlashcardSet = async (index) => {
  const set = flashCardSets[index];
  if (!set) return;

  // If the set already has cards, use it directly
  if (set.cards && set.cards.length > 0) {
    setSelectedSet(set);
    setIsViewerOpen(true);
    return;
  }

  // Otherwise fetch the full set by ID
  const fullSet = await fetchSetById(set._id);
  if (fullSet) {
    setSelectedSet(fullSet);
    setIsViewerOpen(true);
  }
};

  const fetchSetById = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/flashcards/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to fetch set');
      const fullSet = await res.json();

      // Update in state so next time it's available
      setFlashCardSets(prev =>
        prev.map(s => (s._id === fullSet._id ? fullSet : s))
      );

      setSelectedSet(fullSet);
      return fullSet;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  return (
    <div className='flashcards-container'>
      <Sidebar />
      <div className="flashcards-content-wrapper">
        <Navbar />
        <main className="flashcards-main">
          <WelcomeBanner
            subtitle="Welcome To"
            title="Your Flashcard Learning Hub"
            description="Master concepts faster with quick reviews and smart recall. Let’s turn revision into a fun daily habit!"
            buttonText="+ Add Flashcards"
            onButtonClick={handleAddFlashcardSet}
            // animation="https://lottie.host/702419b2-3618-462f-8426-c6f1e65cbb22/wNiyt44PGI.lottie"
          />

          <LearningHeader header="Flashcards" />

          <div className="flashcard-sets">
            {Array.isArray(flashCardSets) && flashCardSets.map((set, index) => (
              <FlashcardSet
                key={set._id || index}
                title={set.title}
                description={set.description}
                onEdit={() => handleEditFlashcardSet(index)}
                onView={() => handleViewFlashcardSet(index)}
                onDelete={() => handleDeleteFlashcardSet(set._id)}
              />
            ))}
          </div>

          
          <CreateFlashcard
            isOpen={isCreateOpen}
            isClose={() => setIsCreateOpen(false)}
            onSave={handleSaveSet}
          />

          
          <EditFlashcard
            isOpen={isEditOpen}
            isClose={() => setIsEditOpen(false)}
            onUpdate={handleUpdateSet}
            initialData={editIndex !== null ? flashCardSets[editIndex] : null}
          />

          <ViewFlashcards
            isOpen={isViewerOpen}
            isClose={() => setIsViewerOpen(false)}
            setData={selectedSet}
            onNeedFetch={fetchSetById}
          />

        </main>
      </div>
    </div>
  );
}

export default Flashcards;
