import React from 'react';
import { MessageSquare, Clock, User, Bot, Trash2 } from 'lucide-react';

export default function ChatHistoryView({ history, onClearHistory }) {
  return (
    <div className="user-panel" style={{ flex: 1 }}>
      <div className="panel-header" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <MessageSquare size={20} color="#7C3AED" />
          AI Conversation History & Audit Logs
        </h2>
        {history.length > 0 && (
          <button
            className="btn-danger"
            onClick={onClearHistory}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#EF4444',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13px',
              transition: 'all 0.2s ease'
            }}
            title="Delete all conversation history"
          >
            <Trash2 size={15} />
            Clear All History
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '8px' }}>
        {history.length === 0 ? (
          <div style={{ color: '#9CA3AF', padding: '24px', textAlign: 'center' }}>No past conversations recorded yet.</div>
        ) : (
          history.map((h, i) => (
            <div key={i} style={{
              background: '#1E2430',
              border: '1px solid #232936',
              borderRadius: '12px',
              padding: '14px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: h.sender === 'user' ? '#3B82F6' : '#7C3AED',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  {h.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                  {h.sender === 'user' ? 'Admin Command' : 'AI Response'}
                </span>
                <span style={{ fontSize: '11px', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} />
                  {h.timestamp || 'Just now'}
                </span>
              </div>
              <p style={{ fontSize: '14px', color: '#F3F4F6', lineHeight: 1.5 }}>{h.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
