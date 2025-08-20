import React from 'react';
import './YourTools.css';
import { PiCardsThree } from "react-icons/pi";
import { RiMindMap } from "react-icons/ri";
import { FaRegNoteSticky } from "react-icons/fa6";
import { IoTimerOutline } from "react-icons/io5";
import { Link } from 'react-router-dom';

const YourTools = () => {
  const tools = [
    {
      id: 1,
      name: 'Flashcard',
      text: 'Create Flashcards',
      icon: <PiCardsThree />,
      bgColor: '#8B7CF6',
      path: '/flashcards'
    },
    {
      id: 2,
      name: 'Mind Map',
      text: 'Create Mind Maps',
      icon: <RiMindMap />,
      bgColor: '#67E8F9',
      path: '/mindmaps'
    },
    {
      id: 3,
      name: 'Notes',
      text: 'Create Notes',
      icon: <FaRegNoteSticky />,
      bgColor: '#F9A8D4',
      path: '/notes'
    },
    {
      id: 4,
      name: 'Pomodoro',
      text: 'Start Timer',
      icon: <IoTimerOutline />,
      bgColor: '#6EE7B7',
      path: '/pomodoro'
    }
  ];

  return (
    <div className="your-tools">
      <h2 className="your-tools-title">Your Tools</h2>
      <div className="tools-list">
        {tools.map((tool) => (
          <Link 
            key={tool.id} 
            to={tool.path} 
            className="tool-item" 
            style={{ backgroundColor: tool.bgColor }}
          >
            <div className="tool-icon">
              {tool.icon}
            </div>
            <div className="tool-info">
              <h3 className="tool-name">{tool.name}</h3>
              <p className="tool-points">{tool.text}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default YourTools;
