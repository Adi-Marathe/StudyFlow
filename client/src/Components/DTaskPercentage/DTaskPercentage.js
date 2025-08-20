import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DTaskPercentage.css';

const DTaskPercentage = ({
  stats = { total: 0, todo: 0, inProgress: 0, done: 0 }
}) => {
  const { total, todo, inProgress, done } = stats;
  const safeTotal = Math.max(total, 1); // avoid division by zero

  // Radii for three rings: done (outer), todo (middle), inProgress (inner)
  const radii = { outer: 90, middle: 70, inner: 50 };
  const circumference = r => 2 * Math.PI * r;

  // Calculate percentages for each ring
  const donePercentage = (done / safeTotal) * 100;
  const todoPercentage = (todo / safeTotal) * 100;
  const inProgressPercentage = (inProgress / safeTotal) * 100;

  // Stroke lengths (dasharray) per ring
  const dashOuter   = (donePercentage / 100) * circumference(radii.outer);
  const dashMiddle  = (todoPercentage / 100) * circumference(radii.middle);
  const dashInner   = (inProgressPercentage / 100) * circumference(radii.inner);

  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/taskmanager');
  };

  return (
    <div className="d-task-percentage-card">
      <div className="d-tp-header">
        <h3 className="d-tp-title">Your Task Percentage</h3>
        <button className="d-tp-menu">⋯</button>
      </div>

      <div className="d-tp-body" onClick={handleClick} style={{ cursor: 'pointer' }}>
        {/* ---------- Chart ---------- */}
        <div className="d-tp-chart">
          <svg width="240" height="240" viewBox="0 0 240 240">
            {/* background tracks */}
            <circle cx="120" cy="120" r={radii.outer} fill="none" stroke="#e5e7eb" strokeWidth="12" />
            <circle cx="120" cy="120" r={radii.middle} fill="none" stroke="#e5e7eb" strokeWidth="12" />
            <circle cx="120" cy="120" r={radii.inner} fill="none" stroke="#e5e7eb" strokeWidth="12" />

            {/* progress rings (rotate -90° so they start at top) */}
            {/* Done ring (outermost - green) */}
            <circle
              cx="120" cy="120" r={radii.outer}
              fill="none" stroke="#22c55e"
              strokeWidth="12" strokeLinecap="round"
              strokeDasharray={`${dashOuter} ${circumference(radii.outer)}`}
              transform="rotate(-90 120 120)"
              className="d-tp-ring d-tp-ring-outer"
            />
            {/* To do ring (middle - pink/coral) */}
            <circle
              cx="120" cy="120" r={radii.middle}
              fill="none" stroke="#ff8687"
              strokeWidth="12" strokeLinecap="round"
              strokeDasharray={`${dashMiddle} ${circumference(radii.middle)}`}
              transform="rotate(-90 120 120)"
              className="d-tp-ring d-tp-ring-middle"
            />
            {/* In Progress ring (innermost - teal) */}
            <circle
              cx="120" cy="120" r={radii.inner}
              fill="none" stroke="#4fc3c9"
              strokeWidth="12" strokeLinecap="round"
              strokeDasharray={`${dashInner} ${circumference(radii.inner)}`}
              transform="rotate(-90 120 120)"
              className="d-tp-ring d-tp-ring-inner"
            />
          </svg>
        </div>

        {/* ---------- Legend ---------- */}
        <ul className="d-tp-legend">
          <li>
            <span className="dot dot-green" /> Done&nbsp;
            {String(done).padStart(2, '0')}
          </li>
          <li>
            <span className="dot dot-pink" /> To do&nbsp;
            {String(todo).padStart(2, '0')}
          </li>
          <li>
            <span className="dot dot-teal" /> In Progress&nbsp;
            {String(inProgress).padStart(2, '0')}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DTaskPercentage;
