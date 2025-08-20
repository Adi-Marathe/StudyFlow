import './ChatbotPreview.css';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useNavigate } from 'react-router-dom';

function ChatbotPreview(){

    const navigate = useNavigate();
    
    const handleClick = () => {
      navigate('/chatbot');
    };

    return(
        <>
        <div className='ChabotPreview-Container'>
            <h2 className='ChatbotPreview-title'>Talk to Chatbot</h2>
            <div className='ChatbotPreview-main' onClick={handleClick} style={{ cursor: 'pointer' }}>
                <div className='chatbot-animation'>
                    <DotLottieReact
                      src="https://lottie.host/ff4ba932-df43-4f7d-b9fa-9a66df84b112/E34KnmsmCP.lottie"
                      loop
                      autoplay
                    />
                </div>
                <div className='chatbot-slogan'>
                    <p>Ask Anything</p>
                    <p>Learn Anything</p>
                    <p>Explore Anything</p>
                </div>
            </div>
        </div>
        </>
    );
}

export default ChatbotPreview;