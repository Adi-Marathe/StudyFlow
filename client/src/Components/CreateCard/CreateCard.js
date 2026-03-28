import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGripVertical, faTrash } from '@fortawesome/free-solid-svg-icons';
import "../../Components/CreateCard/CreateCard.css";

function CreateCard({
  index,
  question,
  answer,
  onChange,
  onDelete,
  questionInvalid = false,
  answerInvalid = false,
  errorShake = false,
  draggableProvided,
  dragHandleProps,
  isDragging = false
}) {
  const draggableProps = draggableProvided?.draggableProps || {};

  return (
    <div
      className={`container ${isDragging ? 'card-dragging' : ''}`}
      data-draggable-card="true"
      ref={draggableProvided?.innerRef}
      {...draggableProps}
      style={draggableProps.style}
    >
      <div className="card-navbar">
        <div className='index'>{index + 1}</div>
        <div className='card-options'>
          <button
            type="button"
            className='card-drag'
            title="Hold and drag to reorder"
            {...(dragHandleProps || {})}
          >
            <FontAwesomeIcon icon={faGripVertical} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className='card-delete'
            title="Delete card"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </div>
      <div className="main">
        <div className="term">
          <input
            className={`${questionInvalid ? "card-input-invalid" : ""} ${questionInvalid && errorShake ? "card-input-shake-a" : ""} ${questionInvalid && !errorShake ? "card-input-shake-b" : ""}`.trim()}
            placeholder="Write Question"
            value={question}
            onChange={(e) => onChange("question", e.target.value)}
          />
          <p>Term</p>
        </div>
        <div className="define">
          <input
            className={`${answerInvalid ? "card-input-invalid" : ""} ${answerInvalid && errorShake ? "card-input-shake-a" : ""} ${answerInvalid && !errorShake ? "card-input-shake-b" : ""}`.trim()}
            placeholder="Write Answer"
            value={answer}
            onChange={(e) => onChange("answer", e.target.value)}
          />
          <p>Definition</p>
        </div>
      </div>
      
    </div>
  );
}

export default CreateCard;
