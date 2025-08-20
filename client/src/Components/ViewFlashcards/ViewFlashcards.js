import { useState, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import "./ViewFlashcards.css";

function ViewFlashcards({ isOpen, isClose, setData, onNeedFetch }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState([]);
  const [setSlideDirection] = useState("");

  useEffect(() => {
  if (!isOpen) return;

  const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        setFlipped(false);
        setIndex((prev) => (prev - 1 + cards.length) % cards.length);
      } else if (e.key === "ArrowRight") {
        setFlipped(false);
        setIndex((prev) => (prev + 1) % cards.length);
      } else if (e.key === " ") {
        e.preventDefault(); // stop page from scrolling
        setFlipped((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, cards.length]);

  const handleNext = () => {
    if (index < cards.length - 1) {
      setSlideDirection("right");
      setFlipped(false);
      setTimeout(() => {
        setIndex(index + 1);
        setSlideDirection("");
      }, 300); // must match CSS animation time
    }
  };

  const handlePrev = () => {
    if (index > 0) {
      setSlideDirection("left");
      setFlipped(false);
      setTimeout(() => {
        setIndex(index - 1);
        setSlideDirection("");
      }, 300);
    }
  };

  // Ensure we always have full set data (with cards)
  useEffect(() => {
    const loadSet = async () => {
      if (!setData) return;
      if (setData.cards && setData.cards.length > 0) {
        setCards(setData.cards);
      } else if (onNeedFetch) {
        setLoading(true);
        const fullSet = await onNeedFetch(setData._id);
        setCards(fullSet?.cards || []);
        setLoading(false);
      }
    };
    loadSet();
    setIndex(0);
    setFlipped(false);
  }, [setData, onNeedFetch]);

  const currentCard = useMemo(() => cards[index] || null, [cards, index]);

  if (!isOpen) return null;

  return (
    <div className="vf-overlay">
      <div className="vf-modal">
        <div className="vf-header">
          <button className="vf-close-btn" onClick={isClose}>
            <FontAwesomeIcon icon={faChevronLeft} /> Back
          </button>
          <h3>{setData?.title || "Flashcards"}</h3>
          {cards.length > 0 && (
            <div className="vf-card-no">
              <span>
                {index + 1} / {cards.length}
              </span>
            </div>
          )}

        </div>

        <div className="vf-body">
          <button className="left-btn" onClick={handlePrev} disabled={index===0}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>

          {loading ? (
            <p className="vf-loading">Loading cards...</p>
          ) : cards.length === 0 ? (
            <p className="vf-empty">No flashcards available in this set.</p>
          ) : (
            <div className={`vf-flashcard ${flipped ? "flipped" : ""}`} onClick={() => setFlipped(!flipped)}>
              <div className="front">
                <p>{currentCard?.question}</p>
              </div>
              <div className="back">
                <p>{currentCard?.answer}</p>
              </div>
            </div>
          )}

          <button className="right-btn" onClick={handleNext} disabled={index === cards.length-1}>
            <FontAwesomeIcon icon={faChevronRight} />
          </button>

        </div>
      </div>
    </div>
  );
}

export default ViewFlashcards;
