import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import "../../Components/CreateFlashcard/CreateFlashcard.css";
import CreateCard from '../CreateCard/CreateCard';
import { useState } from 'react';

function CreateFlashcard({ isOpen, isClose, onSave }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cards, setCards] = useState([]);

  if (!isOpen) return null;

  const handleAddCards = () => {
    setCards([...cards, { question: "", answer: "" }]);
  };

  const handleDeleteCards = (index) => {
    setCards(cards.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if(!title.trim()){
      alert("Please enter a title");
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, cards })
      });
    
      const data = await res.json();
    
      if (res.ok) {
        onSave(data); // add new set to frontend list
        isClose();
        setTitle("");
        setDescription("");
        setCards([]);
      } else {
        console.error('Error creating flashcard:', data);
      }
    } catch (err) {
      console.error('Request failed:', err);
    }
  };

  return (
    <div className='modal-overlay'>
      <div className="container-modal">
        <div className="Navbar">
          <h4>Create Flashcard Below!</h4>
          <button className="close-btn" onClick={isClose}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

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
          <button id='save' onClick={handleSave}>Save & Create</button>
        </div>
      </div>
    </div>
  );
}

export default CreateFlashcard;
