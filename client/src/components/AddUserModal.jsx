import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';

export default function AddUserModal({ onClose, onAdd }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [status, setStatus] = useState('Active');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    onAdd({ name, email, phone, city, status });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(11, 14, 20, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: '#151921',
        border: '1px solid #232936',
        borderRadius: '16px',
        padding: '28px',
        width: '420px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus size={20} color="#7C3AED" />
            Add New User Record
          </h3>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>Full Name</label>
            <input type="text" className="search-input" style={{ paddingLeft: '14px' }} value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>Email Address</label>
            <input type="email" className="search-input" style={{ paddingLeft: '14px' }} value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>Phone</label>
            <input type="text" className="search-input" style={{ paddingLeft: '14px' }} value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>City</label>
            <input type="text" className="search-input" style={{ paddingLeft: '14px' }} value={city} onChange={(e) => setCity(e.target.value)} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>Status</label>
            <select className="search-input" style={{ paddingLeft: '14px' }} value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Active">Active</option>
              <option value="Offline">Offline</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-icon" onClick={onClose} style={{ padding: '8px 16px' }}>Cancel</button>
            <button type="submit" className="btn-primary">Save User</button>
          </div>
        </form>
      </div>
    </div>
  );
}
