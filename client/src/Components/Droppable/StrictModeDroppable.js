import { useEffect, useState } from 'react';
import { Droppable } from 'react-beautiful-dnd';

function StrictModeDroppable(props) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const animationFrame = requestAnimationFrame(() => setEnabled(true));

    return () => {
      cancelAnimationFrame(animationFrame);
      setEnabled(false);
    };
  }, []);

  if (!enabled) return null;

  return <Droppable {...props} />;
}

export default StrictModeDroppable;
