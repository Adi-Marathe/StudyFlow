import React, { useState, useRef, useEffect } from 'react';
import { Send,BotMessageSquare } from 'lucide-react';
import axios from 'axios';
import './Aibot.css';
import logo from '../../Assets/images/StudyFlow-logo.png'

const Aibot = ({ username = "Aditya" }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showInitialState, setShowInitialState] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputMessage('');

    if (showInitialState) {
      setIsTransitioning(true);
      setTimeout(() => {
        setShowInitialState(false);
        setIsTransitioning(false);
      }, 500);
    }

    setIsTyping(true);

    try {
      const payload = {
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          ...updatedMessages.map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content
          }))
        ]
      };

      const res = await axios.post('http://localhost:5000/api/chat', payload);
      const aiResponseText = res.data.reply;

      const aiResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: aiResponseText,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (err) {
      const errorResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'AI API Error: ' + (err.response?.data?.message || err.message),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };
   
  const removeThinkTag = (text) => {
    if (!text) return '';
    return text.replace(/<\s*think\s*>[\s\S]*?<\s*\/\s*think\s*>/gi, '').trim();
  };

  return (
    <div className="ai-chatbot">
      <div className={`initial-state ${isTransitioning ? 'fade-out' : ''}`} 
           style={{ display: showInitialState ? 'flex' : 'none' }}>
        <div className="animation-container"></div>
        <div className="greeting-text">
          <h2>{getGreeting()}, {username}</h2>
          <p>How Can I <span className="assist-text">Assist You Today?</span></p>
        </div>
      </div>

      <div className={`chat-container ${!showInitialState ? 'fade-in' : ''}`}>
        <div className="messages-container">
          {messages.map((message) => (
            <div key={message.id} className={`message-wrapper ${message.type}`}>
              <div className="message-content">
                <div className="avatar">
                  {message.type === 'user' ? (
                    <div className="user-avatar">{username.charAt(0).toUpperCase()}</div>
                  ) : (
                    <div className="bot-avatar">
                      <img src={logo} alt="logo" height={40}/>
                    </div>
                  )}
                </div>
                <div className="message-bubble">
                  <div className="message-text">
                    {message.type === 'bot' ? removeThinkTag(message.content) : message.content}
                  </div>
                </div>
              </div>
            </div>
          ))}
  
          {isTyping && (
            <div className="message-wrapper bot">
              <div className="message-content">
                <div className="avatar">
                  <div className="bot-avatar">
                     <img src={logo} alt="logo" width={20} height={20} />
                  </div>
                </div>
                <div className="message-bubble typing-bubble">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="input-container">
        <div className="input-wrapper">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask anything"
            className="message-input"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            className="send-button"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Aibot;
