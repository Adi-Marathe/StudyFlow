import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import "../../Components/CreateFlashcard/CreateFlashcard.css";
import CreateCard from '../CreateCard/CreateCard';
import StrictModeDroppable from '../Droppable/StrictModeDroppable';
import { useEffect, useState } from 'react';
import { DragDropContext, Draggable } from 'react-beautiful-dnd';
import { toast } from 'react-toastify';

const createLocalId = () => `card-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
const createBlankCard = () => ({ _localId: createLocalId(), question: "", answer: "" });
const getDefaultCards = () => ([
  createBlankCard(),
  createBlankCard(),
  createBlankCard(),
]);

const reorderCards = (list, startIndex, endIndex) => {
  const updated = [...list];
  const [movedCard] = updated.splice(startIndex, 1);
  updated.splice(endIndex, 0, movedCard);
  return updated;
};

function CreateFlashcard({ isOpen, isClose, onSave }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cards, setCards] = useState(getDefaultCards);
  const [cardErrors, setCardErrors] = useState({});
  const [errorShake, setErrorShake] = useState(false);

  // Every time create page opens, start fresh with 3 default cards.
  useEffect(() => {
    if (!isOpen) return;
    setTitle("");
    setDescription("");
    setCards(getDefaultCards());
    setCardErrors({});
    setErrorShake(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddCards = () => {
    setCards([...cards, createBlankCard()]);
  };

  const handleDeleteCards = (index) => {
    const cardToDelete = cards[index];
    setCards(cards.filter((_, i) => i !== index));

    if (cardToDelete?._localId) {
      setCardErrors((prev) => {
        if (!prev[cardToDelete._localId]) return prev;
        const updated = { ...prev };
        delete updated[cardToDelete._localId];
        return updated;
      });
    }
  };

  const handleDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.index === destination.index) return;

    setCards((prevCards) =>
      reorderCards(prevCards, source.index, destination.index)
    );
  };

  const handleSave = async () => {
    if(!title.trim()){
      toast.warning('Please enter a title');
      return;
    }

    const nextErrors = {};
    cards.forEach((card) => {
      const questionMissing = !card.question?.trim();
      const answerMissing = !card.answer?.trim();

      if (questionMissing || answerMissing) {
        nextErrors[card._localId] = {
          question: questionMissing,
          answer: answerMissing
        };
      }
    });

    if (Object.keys(nextErrors).length > 0) {
      setCardErrors(nextErrors);
      setErrorShake((prev) => !prev);
      toast.error('Please fill both Question and Answer in all cards');
      return;
    }

    setCardErrors({});

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          cards: cards.map(({ question, answer }) => ({ question, answer }))
        })
      });
    
      const data = await res.json();
    
      if (res.ok) {
        onSave(data); // add new set to frontend list
        toast.success('Flashcard set created successfully');
        setTitle("");
        setDescription("");
        setCards(getDefaultCards());
        setCardErrors({});
        setErrorShake(false);
        isClose();
      } else {
        console.error('Error creating flashcard:', data);
        toast.error(data?.error || 'Failed to create flashcard set');
      }
    } catch (err) {
      console.error('Request failed:', err);
      toast.error('Request failed while creating flashcard set');
    }
  };

  return (
      <div
        className="container-modal flashcard-form-modal create-flashcard-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Create flashcard set"
      >
        <div className="Navbar">
          <button className="close-btn" onClick={isClose}>
            <FontAwesomeIcon icon={faAngleLeft} />
            Back
          </button>
          <h4>Create Flashcard Below!</h4>
        </div>

        <div className='createFlashcard-body'>
        <div className="Header">
          <div className="cf-title">
            <h4>Title</h4>
            <input
              className="header-search"
              placeholder="Enter Title of Flashcard"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="cf-description">
            <h4>Description</h4>
            <input
              className="header-search"
              placeholder="Add Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <StrictModeDroppable droppableId="create-cards-list">
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
                          setCards((prevCards) => {
                            const updatedCards = [...prevCards];
                            updatedCards[index][field] = value;
                            return updatedCards;
                          });

                          if (value.trim() && card._localId) {
                            setCardErrors((prev) => {
                              const existing = prev[card._localId];
                              if (!existing || !existing[field]) return prev;

                              const updated = { ...prev };
                              const nextCardError = {
                                ...existing,
                                [field]: false
                              };

                              if (!nextCardError.question && !nextCardError.answer) {
                                delete updated[card._localId];
                              } else {
                                updated[card._localId] = nextCardError;
                              }

                              return updated;
                            });
                          }
                        }}
                        onDelete={() => handleDeleteCards(index)}
                        questionInvalid={Boolean(cardErrors[card._localId]?.question)}
                        answerInvalid={Boolean(cardErrors[card._localId]?.answer)}
                        errorShake={errorShake}
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
          <button id='save' onClick={handleSave}>Save & Create</button>
        </div>
      </div>
  );
}

export default CreateFlashcard;
