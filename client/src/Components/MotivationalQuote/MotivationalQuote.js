import React, { useState, useEffect } from 'react';
import './MotivationalQuote.css';

const quotes = [
  { text: "Discipline beats motivation every single time.", author: "Focus Mindset" },
  { text: "The secret of getting ahead is getting started.", author: "Focus Mindset" },
  { text: "Focus is the art of knowing what to ignore.", author: "Focus Mindset" },
  { text: "Small daily improvements lead to stunning results.", author: "Focus Mindset" },
  { text: "Don't count the hours. Make the hours count.", author: "Focus Mindset" },
  { text: "Deep work is the superpower of the 21st century.", author: "Focus Mindset" },
];

function MotivationalQuote() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex(i => (i + 1) % quotes.length);
        setFade(true);
      }, 400);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const { text, author } = quotes[index];

  return (
    <div className="mq-card">
      <div className="mq-top-line" />
      <div className={`mq-content ${fade ? 'mq-content--in' : 'mq-content--out'}`}>
        <p className="mq-quote">"{text}"</p>
        <p className="mq-author">— {author.toUpperCase()}</p>
      </div>
      <div className="mq-dots">
        {quotes.map((_, i) => (
          <button
            key={i}
            className={`mq-dot ${i === index ? 'mq-dot--active' : ''}`}
            onClick={() => { setFade(false); setTimeout(() => { setIndex(i); setFade(true); }, 400); }}
          />
        ))}
      </div>
    </div>
  );
}

export default MotivationalQuote;