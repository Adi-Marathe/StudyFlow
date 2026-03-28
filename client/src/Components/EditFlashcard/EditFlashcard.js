import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import "../../Components/EditFlashcard/EditFlashcard.css";
import CreateCard from '../CreateCard/CreateCard';
import StrictModeDroppable from '../Droppable/StrictModeDroppable';
import { useEffect, useState } from 'react';
import { DragDropContext, Draggable } from 'react-beautiful-dnd';
import { toast } from 'react-toastify';

const createLocalId = () => `card-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
const normalizeCards = (cards = []) =>
  cards.map((card, index) => ({
    ...card,
    _localId: card._localId || card._id || `${createLocalId()}-${index}`
  }));

const reorderCards = (list, startIndex, endIndex) => {
  const updated = [...list];
  const [movedCard] = updated.splice(startIndex, 1);
  updated.splice(endIndex, 0, movedCard);
  return updated;
};

function EditFlashcard({ isOpen, isClose, onUpdate, initialData }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cards, setCards] = useState([]);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setCards(normalizeCards(initialData.cards));
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleAddCards = () => {
    setCards([...cards, { _localId: createLocalId(), question: "", answer: "" }]);
  };

  const handleDeleteCards = (index) => {
    setCards(cards.filter((_, i) => i !== index));
  };

  const handleDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.index === destination.index) return;

    setCards((prevCards) =>
      reorderCards(prevCards, source.index, destination.index)
    );
  };

  const handleUpdate = async () => {
    const updatedSet = {
      title,
      description,
      cards: cards.map(({ question, answer }) => ({ question, answer }))
    };
    
    try {
      const res = await fetch(`http://localhost:5000/api/flashcards/${initialData._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(updatedSet)
      });
    
      if (!res.ok) throw new Error("Failed to update flashcard set");
    
      const savedSet = await res.json();
      onUpdate(savedSet); // update local state in parent
      toast.success('Flashcard set saved successfully');
      isClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save flashcard set');
    }
  };

  return (
      <div
        className="container-modal flashcard-form-modal edit-flashcard-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Edit flashcard set"
      >
        <div className="Navbar">
          <button className="close-btn" onClick={isClose}>
            <FontAwesomeIcon icon={faAngleLeft} />
            Back
          </button>
          <h4>Edit Flashcard</h4>
        </div>

        <div className='createFlashcard-body'>
        <div className="Header">
          <div className="ef-title">
            <h4>Title</h4>
            <input
              className="header-search"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="ef-description">
            <h4>Description</h4>
            <input
              className="header-search"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <StrictModeDroppable droppableId="edit-cards-list">
            {(dropProvided) => (
              <div
                className="cards"
                ref={dropProvided.innerRef}
                {...dropProvided.droppableProps}
              >
                {cards.map((card, index) => (
                  <Draggable
                    key={card._localId}
                    draggableId={card._localId}
                    index={index}
                  >
                    {(dragProvided, dragSnapshot) => (
                      <CreateCard
                        index={index}
                        question={card.question}
                        answer={card.answer}
                        onChange={(field, value) => {
                          const updatedCards = [...cards];
                          updatedCards[index][field] = value;
                          setCards(updatedCards);
                        }}
                        onDelete={() => handleDeleteCards(index)}
                        draggableProvided={dragProvided}
                        dragHandleProps={dragProvided.dragHandleProps}
                        isDragging={dragSnapshot.isDragging}
                      />
                    )}
                  </Draggable>
                ))}
                {dropProvided.placeholder}
              </div>
            )}
          </StrictModeDroppable>
        </DragDropContext>
        </div>

        <div className="Options-section">
          <button id='add-card' onClick={handleAddCards}>Add Card</button>
          <button id='save' onClick={handleUpdate}>Update</button>
        </div>
      </div>
  );
}

export default EditFlashcard;
