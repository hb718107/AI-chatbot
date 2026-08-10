import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Snackbar({ message, type = 'success', onClose, duration = 4000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div style={{
      position: 'fixed',
      bottom: '28px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: isSuccess ? 'rgba(16, 185, 129, 0.95)' : 'rgba(239, 68, 68, 0.95)',
      color: '#fff',
      padding: '12px 20px',
      borderRadius: '12px',
      boxShadow: isSuccess
        ? '0 10px 30px rgba(16, 185, 129, 0.4)'
        : '0 10px 30px rgba(239, 68, 68, 0.4)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      zIndex: 2000,
      fontSize: '14px',
      fontWeight: 500,
      backdropFilter: 'blur(8px)',
      animation: 'slideUpFade 0.3s ease-out'
    }}>
      {isSuccess ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex' }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
