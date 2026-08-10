import React, { useState } from 'react';
import { Lock, User, ShieldCheck, UserPlus } from 'lucide-react';

export default function LoginModal({ onLogin }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isSignUp ? 'http://localhost:5000/api/auth/signup' : 'http://localhost:5000/api/auth/login';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (rememberMe && data.token) {
        localStorage.setItem('wpbrigade_saved_token', data.token);
        localStorage.setItem('wpbrigade_saved_user', data.username);
      } else {
        localStorage.removeItem('wpbrigade_saved_token');
        localStorage.removeItem('wpbrigade_saved_user');
      }

      onLogin(data.username);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(11, 14, 20, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: '#151921',
        border: '1px solid #232936',
        borderRadius: '20px',
        padding: '36px',
        width: '400px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #7C3AED, #3B82F6)',
            borderRadius: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
            boxShadow: '0 0 16px rgba(124, 58, 237, 0.4)'
          }}>
            {isSignUp ? <UserPlus size={28} color="#fff" /> : <ShieldCheck size={28} color="#fff" />}
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#fff' }}>
            {isSignUp ? 'Create Admin Account' : 'WPBrigade AI Login'}
          </h2>
          <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px' }}>
            {isSignUp ? 'Register new admin credentials' : 'Sign in to access admin portal'}
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #EF4444',
            color: '#EF4444',
            fontSize: '13px',
            padding: '10px',
            borderRadius: '8px',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#9CA3AF', marginBottom: '6px' }}>Username</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input
                type="text"
                className="search-input"
                style={{ paddingLeft: '40px' }}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#9CA3AF', marginBottom: '6px' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input
                type="password"
                className="search-input"
                style={{ paddingLeft: '40px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {!isSignUp && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: '#7C3AED', cursor: 'pointer' }}
              />
              <label htmlFor="remember" style={{ fontSize: '13px', color: '#9CA3AF', cursor: 'pointer' }}>
                Save login info (Auto-login)
              </label>
            </div>
          )}

          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', marginBottom: '16px' }} disabled={loading}>
            {loading ? 'Processing...' : (isSignUp ? 'Register Admin' : 'Sign In')}
          </button>
        </form>

        <div style={{ textAlign: 'center', borderTop: '1px solid #232936', paddingTop: '16px' }}>
          <button
            type="button"
            className="btn-icon"
            onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
            style={{ fontSize: '13px', color: '#3B82F6' }}
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an admin account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
