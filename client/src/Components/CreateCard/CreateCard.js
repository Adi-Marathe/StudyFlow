import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import "../../Components/CreateCard/CreateCard.css";

function CreateCard({ index, question, answer, onChange, onDelete }) {
  return (
    <div className="container">
      <div className="SrNo">{index + 1}</div>
      <div className="main">
        <div className="term">
          <input
            placeholder="Write Question"
            value={question}
            onChange={(e) => onChange("question", e.target.value)}
          />
          <p>Term</p>
        </div>
        <div className="define">
          <input
            placeholder="Write Answer"
            value={answer}
            onChange={(e) => onChange("answer", e.target.value)}
          />
          <p>Definition</p>
        </div>
      </div>
      <div className="options">
        <button onClick={onDelete}>
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>
    </div>
  );
}

export default CreateCard;
