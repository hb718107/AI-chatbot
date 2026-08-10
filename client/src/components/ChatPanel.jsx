import React, { useState, useEffect, useRef } from 'react';
import { Send, RefreshCw, X } from 'lucide-react';

export default function ChatPanel({ messages, onSendMessage, onClear, onClose, isLoading }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="chat-panel" style={{ height: '100%' }}>
      <div className="chat-header">
        <div className="chat-title-group">
          <div className="status-dot" />
          <span style={{ fontWeight: 600 }}>WPBrigade Assistant</span>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button className="btn-icon" onClick={onClear} title="New Chat">
            <RefreshCw size={16} />
          </button>
          {onClose && (
            <button className="btn-icon" onClick={onClose} title="Close Chat">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((m, index) => (
          <div key={index} className={`message-bubble ${m.sender}`}>
            {m.text}
          </div>
        ))}

        {isLoading && (
          <div className="message-bubble ai" style={{ width: 'fit-content' }}>
            <div className="typing-dots">
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-area" onSubmit={handleSubmit}>
        <input
          type="text"
          className="chat-input"
          placeholder="Type commands... e.g. add john.smith@xyz.com"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="btn-send">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
