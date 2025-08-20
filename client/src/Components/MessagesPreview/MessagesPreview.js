import './MessagesPreview.css';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

function MessagesPreview(){
    return(
        <>
        <div className='MessagesPreview-Container'>
            <h2 className='MessagesPreview-title'>Messages</h2>
            <div className='MessagesPreview-main'>
                <div className='a'>
                <DotLottieReact
                src="https://lottie.host/d8ce0a78-d000-4dfc-ab18-a2bda8fd2dc4/nvXfE6URmE.lottie"
                loop
                autoplay
                />
                </div>
            </div>
        </div>
        </>
    );
}

export default MessagesPreview;