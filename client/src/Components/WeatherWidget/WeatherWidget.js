import React, { useEffect } from 'react';

const WeatherWidget = () => {
  useEffect(() => {
    const checkWidget = () => {
      console.log('Window MeteomaticsWidget:', window.MeteomaticsWidget);
      console.log('All window keys containing "meteo":', 
        Object.keys(window).filter(key => 
          key.toLowerCase().includes('meteo')
        )
      );
      console.log('Found widget elements:', 
        document.querySelectorAll('[data-meteomatics-weather-widget]')
      );
    };

    // Check after delay to allow scripts to load
    setTimeout(checkWidget, 3000);
  }, []);

  return (
    <div
      data-meteomatics-weather-widget="horizontal"
      data-meteomatics-weather-widget-color="light-gray"
      data-meteomatics-weather-widget-title="Kannad, Maharashtra, India"
      data-meteomatics-weather-widget-latitude="21.3573"
      data-meteomatics-weather-widget-longitude="74.2198"
      data-meteomatics-weather-widget-measurement-unit-temperature="celsius"
    >
      <a href="https://www.meteomatics.com">Meteomatics Weather Widget</a>
    </div>
  );
};

export default WeatherWidget;
