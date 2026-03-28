import './FocusModePreview.css';
import { useNavigate } from 'react-router-dom';

function FocusModePreview(){
    const navigate = useNavigate();
    return(
        <>
        <div className='FocusModePreview-Container'>
            <h2 className='FocusModePreview-title'>Focusmode</h2>
            <div className='FocusModePreview-main'>
                <div className='Focus-text'>
                    Stay distraction-free and study smarter
                </div>
                <div classname='Focus-btn'>
                    <div>
                        <button class="button-86" role="button" onClick={() => navigate('/focusmode')} >Focusmode</button>
                    </div>            
                </div>
            </div>
        </div>
        </>
    );
}

export default FocusModePreview;