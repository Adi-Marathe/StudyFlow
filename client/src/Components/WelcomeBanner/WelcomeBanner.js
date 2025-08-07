import React from 'react';
import './WelcomeBanner.css';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const WelcomeBanner = ({
  subtitle = 'subtittle',
  title = 'tittle',
  description = "description",
  buttonText = '+ Add ',
  onButtonClick,
  animation = null,
}) => {
  return (
    <div className="welcome-banner">
      <div className="welcome-content">
        <div className="welcome-text">
          <p className="welcome-subtitle">{subtitle}</p>
          <h2 className="welcome-title">{title}</h2>
          <p className="welcome-description">{description}</p>
          <button type="button" className="add-btn" onClick={onButtonClick}>
            {buttonText}
          </button>
        </div>
        <div className="welcome-animation">
          <DotLottieReact
            src={animation}
            loop
            autoplay
          />
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;
