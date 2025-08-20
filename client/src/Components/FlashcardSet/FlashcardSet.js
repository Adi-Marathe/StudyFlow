import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil, faTrash} from '@fortawesome/free-solid-svg-icons';
import '../../Components/FlashcardSet/FlashcardSet.css';

function FlashcardSet({ title, description, onEdit, onDelete, onView }) {
  return (
    <div className="flashcard-set" onClick={onView}>
      <div className='title-container'>
        <h3 className="title">{title}</h3>
      </div>
      <div className='description-container'>
        <p className="description">{description}</p>
      </div>
      <div className='edit'>
        <button onClick={(e) => { e.stopPropagation(); onEdit(); }}>
          <FontAwesomeIcon icon={faPencil} /> Edit
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }}>
          <FontAwesomeIcon icon={faTrash} /> Delete
        </button>
      </div>
    </div>
  );
}

export default FlashcardSet;

