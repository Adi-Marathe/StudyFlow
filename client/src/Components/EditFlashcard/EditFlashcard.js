import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import "../../Components/EditFlashcard/EditFlashcard.css";
import CreateCard from '../CreateCard/CreateCard';
import { useEffect, useState } from 'react';

function EditFlashcard({ isOpen, isClose, onUpdate, initialData }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cards, setCards] = useState([]);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setCards(initialData.cards || []);
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleAddCards = () => {
    setCards([...cards, { question: "", answer: "" }]);
  };

  const handleDeleteCards = (index) => {
    setCards(cards.filter((_, i) => i !== index));
  };

  const handleUpdate = async () => {
    const updatedSet = { title, description, cards };
    
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
      isClose();
    } catch (err) {
      console.error(err);
    }
  };


  return (
    <div className='modal-overlay'>
      <div className="container-modal">
        <div className="Navbar">
          <h4>Edit Flashcard</h4>
          <button className="close-btn" onClick={isClose}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className="Header">
          <div className="title">
            <h4>Title</h4>
            <input
              className="header-search"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="description">
            <h4>Description</h4>
            <input
              className="header-search"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="cards">
          {cards.map((card, index) => (
            <CreateCard
              key={index}
              index={index}
              question={card.question}
              answer={card.answer}
              onChange={(field, value) => {
                const updatedCards = [...cards];
                updatedCards[index][field] = value;
                setCards(updatedCards);
              }}
              onDelete={() => handleDeleteCards(index)}
            />
          ))}
        </div>

        <div className="Options-section">
          <button id='add-card' onClick={handleAddCards}>Add Card</button>
          <button id='save' onClick={handleUpdate}>Update</button>
        </div>
      </div>
    </div>
  );
}

export default EditFlashcard;
