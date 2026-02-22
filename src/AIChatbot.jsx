import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const AIChatbot = ({ userRole, contextData = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const geminiApiUrl = import.meta.env.VITE_GEMINI_API_URL;

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const buildContextPrompt = () => {
    let context = `You are an AI assistant helping a ${userRole} in a therapy management system. `;
    
    if (contextData.patientName) {
      context += `Current patient: ${contextData.patientName}. `;
    }
    if (contextData.patientCondition) {
      context += `Patient condition: ${contextData.patientCondition}. `;
    }
    if (contextData.sessionCount) {
      context += `Total sessions: ${contextData.sessionCount}. `;
    }
    if (contextData.recentSessions) {
      context += `Recent session data: ${JSON.stringify(contextData.recentSessions)}. `;
    }
    
    return context;
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const contextPrompt = buildContextPrompt();
      const fullPrompt = `${contextPrompt}\n\nUser question: ${inputMessage}\n\nProvide a helpful, concise response.`;

      const response = await fetch(`${geminiApiUrl}?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: fullPrompt
            }]
          }]
        })
      });

      const data = await response.json();
      
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        const aiMessage = {
          role: 'assistant',
          content: data.candidates[0].content.parts[0].text,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error('Invalid response from AI');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <>
      <style jsx>{`
        .chatbot-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
        }

        .chatbot-button {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .chatbot-button:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }

        .chatbot-button i {
          font-size: 24px;
          color: white;
        }

        .chatbot-window {
          position: fixed;
          bottom: 90px;
          right: 20px;
          width: 380px;
          height: 550px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .chatbot-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .chatbot-header h5 {
          margin: 0;
          font-weight: 600;
        }

        .chatbot-header-actions {
          display: flex;
          gap: 10px;
        }

        .chatbot-header button {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        .chatbot-header button:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .chatbot-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          background: #f8f9fa;
        }

        .message {
          margin-bottom: 15px;
          display: flex;
          flex-direction: column;
        }

        .message.user {
          align-items: flex-end;
        }

        .message.assistant {
          align-items: flex-start;
        }

        .message-content {
          max-width: 80%;
          padding: 12px 16px;
          border-radius: 18px;
          word-wrap: break-word;
          line-height: 1.5;
        }

        .message-content p {
          margin: 0 0 8px 0;
        }

        .message-content p:last-child {
          margin-bottom: 0;
        }

        .message-content strong {
          font-weight: 600;
        }

        .message-content em {
          font-style: italic;
        }

        .message-content ul,
        .message-content ol {
          margin: 8px 0;
          padding-left: 20px;
        }

        .message-content li {
          margin: 4px 0;
        }

        .message-content code {
          background: rgba(0, 0, 0, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 13px;
        }

        .message-content pre {
          background: rgba(0, 0, 0, 0.1);
          padding: 10px;
          border-radius: 8px;
          overflow-x: auto;
          margin: 8px 0;
        }

        .message-content pre code {
          background: none;
          padding: 0;
        }

        .message-content h1,
        .message-content h2,
        .message-content h3,
        .message-content h4,
        .message-content h5,
        .message-content h6 {
          margin: 12px 0 8px 0;
          font-weight: 600;
        }

        .message-content h1 { font-size: 1.4em; }
        .message-content h2 { font-size: 1.3em; }
        .message-content h3 { font-size: 1.2em; }
        .message-content h4 { font-size: 1.1em; }
        .message-content h5 { font-size: 1.05em; }
        .message-content h6 { font-size: 1em; }

        .message-content blockquote {
          border-left: 3px solid rgba(0, 0, 0, 0.2);
          padding-left: 12px;
          margin: 8px 0;
          font-style: italic;
        }

        .message-content a {
          color: inherit;
          text-decoration: underline;
        }

        .message.user .message-content {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .message.user .message-content code {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        .message.user .message-content pre {
          background: rgba(255, 255, 255, 0.15);
        }

        .message.assistant .message-content {
          background: white;
          color: #333;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }

        .message.assistant .message-content code {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
        }

        .message.assistant .message-content pre {
          background: #f8f9fa;
        }

        .message-timestamp {
          font-size: 11px;
          color: #999;
          margin-top: 5px;
        }

        .chatbot-input-container {
          padding: 15px;
          background: white;
          border-top: 1px solid #e9ecef;
        }

        .chatbot-input-wrapper {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .chatbot-input {
          flex: 1;
          border: 2px solid #e9ecef;
          border-radius: 25px;
          padding: 10px 15px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }

        .chatbot-input:focus {
          border-color: #667eea;
        }

        .chatbot-send-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s;
        }

        .chatbot-send-btn:hover:not(:disabled) {
          transform: scale(1.1);
        }

        .chatbot-send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .loading-indicator {
          display: flex;
          gap: 5px;
          padding: 12px 16px;
        }

        .loading-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #667eea;
          animation: bounce 1.4s infinite ease-in-out both;
        }

        .loading-dot:nth-child(1) {
          animation-delay: -0.32s;
        }

        .loading-dot:nth-child(2) {
          animation-delay: -0.16s;
        }

        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #999;
          text-align: center;
          padding: 20px;
        }

        .empty-state i {
          font-size: 48px;
          margin-bottom: 15px;
          color: #667eea;
        }

        @media (max-width: 768px) {
          .chatbot-window {
            width: calc(100vw - 40px);
            height: calc(100vh - 120px);
            right: 20px;
          }
        }
      `}</style>

      <div className="chatbot-container">
        {!isOpen && (
          <button 
            className="chatbot-button"
            onClick={() => setIsOpen(true)}
            title="Open AI Assistant"
          >
            <i className="bi bi-robot"></i>
          </button>
        )}

        {isOpen && (
          <div className="chatbot-window">
            <div className="chatbot-header">
              <div>
                <h5>AI Assistant</h5>
                <small style={{ opacity: 0.9 }}>
                  {userRole === 'therapist' ? 'Therapy Support' : 'Session Support'}
                </small>
              </div>
              <div className="chatbot-header-actions">
                <button onClick={clearChat} title="Clear chat">
                  <i className="bi bi-trash"></i>
                </button>
                <button onClick={() => setIsOpen(false)} title="Close">
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
            </div>

            <div className="chatbot-messages" ref={chatContainerRef}>
              {messages.length === 0 ? (
                <div className="empty-state">
                  <i className="bi bi-chat-dots"></i>
                  <h6>How can I help you today?</h6>
                  <p style={{ fontSize: '14px' }}>
                    Ask me about patient progress, session recommendations, or therapy insights.
                  </p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div key={index} className={`message ${msg.role}`}>
                    <div className="message-content">
                      {msg.role === 'assistant' ? (
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      ) : (
                        msg.content
                      )}
                    </div>
                    <div className="message-timestamp">
                      {new Date(msg.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="message assistant">
                  <div className="loading-indicator">
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chatbot-input-container">
              <div className="chatbot-input-wrapper">
                <input
                  type="text"
                  className="chatbot-input"
                  placeholder="Type your message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                />
                <button 
                  className="chatbot-send-btn"
                  onClick={sendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  title="Send message"
                >
                  <i className="bi bi-send-fill"></i>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AIChatbot;
