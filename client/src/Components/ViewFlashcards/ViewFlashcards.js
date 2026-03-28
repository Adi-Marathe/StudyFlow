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
  const [slideDirection, setSlideDirection] = useState("");

  useEffect(() => {
  if (!isOpen) return;

  const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        if (cards.length === 0) return;
        setFlipped(false);
        setIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "ArrowRight") {
        if (cards.length === 0) return;
        setFlipped(false);
        setIndex((prev) => Math.min(prev + 1, cards.length - 1));
      } else if (e.key === " ") {
        e.preventDefault(); // stop page from scrolling
        setFlipped((prev) => !prev);
      } else if (e.key === "Escape") {
        isClose(); // 🔥 ESC closes viewer
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
  const headerProgress = cards.length > 0 ? ((index + 1) / cards.length) * 100 : 0;

  if (!isOpen) return null;

  return (
    <div className="vf-overlay">
      <div className="vf-modal">
        <div
          className="vf-header"
          style={{ "--vf-header-progress": `${headerProgress}%` }}
        >
          <button className="vf-close-btn" onClick={isClose}>
            <FontAwesomeIcon icon={faChevronLeft} /> Back
          </button>
          <h3>{setData?.title || "Flashcards"}</h3>
          {cards.length > 0 && (
            <div className="vf-card-no">
              <span className="vf-card-current">{index + 1}</span>
              <span className="vf-card-separator">/</span>
              <span className="vf-card-total">{cards.length}</span>
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
                <p>{currentCard?.question || "No question added."}</p>
              </div>
              <div className="back">
                <p>{currentCard?.answer || "No answer added."}</p>
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
