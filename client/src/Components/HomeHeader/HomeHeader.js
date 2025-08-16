import React from 'react';
import './HomeHeader.css';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const HomeHeader = ({
  subtitle = 'subtittle',
  title = 'tittle',
  description = "description",
  animation = null,
}) => {
  return (
    <div className="h-welcome-banner">
      <div className="h-welcome-content">
        <div className="h-welcome-text">
          <p className="h-welcome-subtitle">{subtitle}</p>
          <h2 className="h-welcome-title">{title}</h2>
          <p className="h-welcome-description">{description}</p>
        </div>
        <div className="h-welcome-animation">
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

export default HomeHeader;
