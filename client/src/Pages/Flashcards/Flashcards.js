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
import { toast } from 'react-toastify';

function Flashcards() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [flashCardSets, setFlashCardSets] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedSet, setSelectedSet] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const isFlashcardSetModalOpen = isCreateOpen || isEditOpen;

  const fetchSets = async () => {
    try {
      setIsLoading(true);
      setHasFetched(false);

      const res = await fetch('${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/flashcards', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await res.json();

      if (Array.isArray(data)) {
        setFlashCardSets(data);
      } else {
        setFlashCardSets([]);
      }
    } catch (err) {
      console.error('Error fetching flashcards:', err);
      setFlashCardSets([]);
    } finally {
      setIsLoading(false);
      setHasFetched(true);
    }
  };

  // Fetch flashcards on mount
  useEffect(() => {
    fetchSets();
  }, []);

  // Add flashcard set (Create)
  const handleSaveSet = (newSet) => {
    if (!newSet?._id) return;
    setFlashCardSets((prev) => [...prev, newSet]);
    setHasFetched(true);
  };

  // Update flashcard set (Edit)
  const handleUpdateSet = (updatedSet) => {
    if (!updatedSet?._id) return;
    setFlashCardSets((prev) =>
      prev.map((set) => (set._id === updatedSet._id ? updatedSet : set))
    );
  };

  // Delete flashcard set (confirmed)
  const handleDeleteFlashcardSet = async (id) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/flashcards/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!res.ok) throw new Error('Failed to delete flashcard set');

      setFlashCardSets((prev) => prev.filter((set) => set._id !== id));
      setDeleteTarget(null);
      toast.success('Flashcard set deleted successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete flashcard set');
    }
  };

  const handleAddFlashcardSet = () => {
    setIsCreateOpen(true);
  };

  const handleEditFlashcardSet = (index) => {
    setEditIndex(index);
    setIsEditOpen(true);
  };

  const closeFlashcardSetModal = () => {
    setIsCreateOpen(false);
    setIsEditOpen(false);
  };

  const openDeleteConfirm = (setItem) => {
    setDeleteTarget(setItem);
  };

  const closeDeleteConfirm = () => {
    setDeleteTarget(null);
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
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/flashcards/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to fetch set');
      const fullSet = await res.json();

      // Update in state so next time it's available
      setFlashCardSets((prev) =>
        prev.map((s) => (s._id === fullSet._id ? fullSet : s))
      );

      setSelectedSet(fullSet);
      return fullSet;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  return (
    <div className="flashcards-container">
      <Sidebar />
      <div className="flashcards-content-wrapper">
        <Navbar />

        <main className="flashcards-main">
          {isFlashcardSetModalOpen ? (
            <div className="flashcards-inline-editor">
              <CreateFlashcard
                isOpen={isCreateOpen}
                isClose={closeFlashcardSetModal}
                onSave={handleSaveSet}
              />

              <EditFlashcard
                isOpen={isEditOpen}
                isClose={closeFlashcardSetModal}
                onUpdate={handleUpdateSet}
                initialData={editIndex !== null ? flashCardSets[editIndex] : null}
              />
            </div>
          ) : (
            <>
              <div className="flashcards-banner-wrapper">
                <WelcomeBanner
                  subtitle="Welcome To"
                  title="Your Flashcard Learning Hub"
                  description="Master concepts faster with quick reviews and smart recall. Let's turn revision into a fun daily habit!"
                  buttonText="+ Add Flashcards"
                  onButtonClick={handleAddFlashcardSet}
                  // animation="https://lottie.host/702419b2-3618-462f-8426-c6f1e65cbb22/wNiyt44PGI.lottie"
                />
              </div>

              <div className="flashcards-learning-wrapper">
                <LearningHeader header="Your Flashcards" />
              </div>

              <div className="Flashcard-sets-grid-section">
                {/* LOADING STATE */}
                {isLoading && (
                  <div className="flashcard-loader">
                    <div className="spinner"></div>
                    <p>Fetching your flashcards...</p>
                  </div>
                )}

                {/* EMPTY STATE */}
                {!isLoading && hasFetched && flashCardSets.length === 0 && (
                  <div className="flashcard-empty">
                    <h2>No Flashcard Set Yet</h2>
                    <span>Create your first flashcard set</span>
                  </div>
                )}

                {/* SUCCESS STATE */}
                {!isLoading && flashCardSets.length > 0 && (
                  <div className="flashcard-sets">
                    {flashCardSets.map((set, index) => (
                      <FlashcardSet
                        key={set._id || index}
                        title={set.title}
                        description={set.description}
                        cards={set.cards || []}
                        createdAt={set.createdAt}
                        onEdit={() => handleEditFlashcardSet(index)}
                        onView={() => handleViewFlashcardSet(index)}
                        onDelete={() => openDeleteConfirm(set)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          <ViewFlashcards
            isOpen={isViewerOpen}
            isClose={() => setIsViewerOpen(false)}
            setData={selectedSet}
            onNeedFetch={fetchSetById}
          />

          {deleteTarget && (
            <div className="flashcards-confirm-backdrop" onClick={closeDeleteConfirm}>
              <div
                className="flashcards-confirm-modal"
                onClick={(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label="Delete confirmation"
              >
                <h3>Are you sure?</h3>
                <p>
                  This will permanently delete
                  {' '}
                  <strong>{deleteTarget.title || 'this flashcard set'}</strong>
                  .
                </p>
                <div className="flashcards-confirm-actions">
                  <button
                    type="button"
                    className="flashcards-confirm-cancel"
                    onClick={closeDeleteConfirm}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="flashcards-confirm-delete"
                    onClick={() => handleDeleteFlashcardSet(deleteTarget._id)}
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Flashcards;
