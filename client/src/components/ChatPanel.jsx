import React, { useState, useEffect, useRef } from 'react';
import { Send, RefreshCw, X, Mic, MicOff } from 'lucide-react';

export default function ChatPanel({ messages, onSendMessage, onClear, onClose, isLoading }) {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [autoExecute, setAutoExecute] = useState(true);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        setTranscribing(true);

        const formData = new FormData();
        formData.append('audio', audioBlob, 'command.webm');

        try {
          const res = await fetch('http://localhost:5000/api/voice/transcribe', {
            method: 'POST',
            body: formData
          });
          const text = await res.text();
          try {
            const data = JSON.parse(text);
            if (data.text) {
              const transcribedText = data.text.trim();
              if (autoExecute && transcribedText) {
                onSendMessage(transcribedText);
                setInput('');
              } else {
                setInput(transcribedText);
              }
            } else if (data.error) {
              console.error('Server transcription error:', data.error);
            }
          } catch (e) {
            console.error('Non-JSON response from server:', text);
          }
        } catch (err) {
          console.error('Transcription fetch error:', err);
        } finally {
          setTranscribing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert('Microphone permission required for voice commands.');
    }
  };

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
          <div className="chat-avatar">AI</div>
          <div>
            <h3>WPBrigade Assistant</h3>
            <span className="chat-status-text">
              {transcribing ? 'Transcribing Voice...' : isRecording ? 'Listening...' : 'Online'}
            </span>
          </div>
        </div>
        <div className="chat-actions">
          <button
            className={`btn-auto-toggle ${autoExecute ? 'active' : ''}`}
            onClick={() => setAutoExecute(!autoExecute)}
            title={autoExecute ? "Hands-Free Auto-Execute: ON" : "Hands-Free Auto-Execute: OFF (Transcribe Only)"}
          >
            ⚡ {autoExecute ? 'Hands-Free: ON' : 'Transcribe Only'}
          </button>
          <button className="btn-icon" onClick={onClear} title="Clear Chat History">
            <RefreshCw size={16} />
          </button>
          {onClose && (
            <button className="btn-icon" onClick={onClose} title="Close Assistant">
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
        <button
          type="button"
          className={`btn-mic ${isRecording ? 'recording' : ''}`}
          onClick={toggleRecording}
          title={isRecording ? "Click to stop recording" : "Click to speak voice command"}
        >
          {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
        </button>
        <input
          type="text"
          className="chat-input"
          placeholder={transcribing ? "Transcribing voice command..." : "Type or speak commands..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={transcribing}
        />
        <button type="submit" className="btn-send" disabled={isLoading || transcribing}>
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
