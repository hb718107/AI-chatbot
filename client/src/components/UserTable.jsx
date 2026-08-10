import React from 'react';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';

export default function UserTable({ users, onDelete, onSearch, searchQuery, onAddClick, highlightedId }) {
  return (
    <div className="user-panel">
      <div className="panel-header">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <button className="btn-primary" onClick={onAddClick}>
          <Plus size={18} />
          Add User
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="user-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Status</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isHighlighted = highlightedId && (u.id === highlightedId || u.email === highlightedId);
              return (
                <tr key={u.id || u.email} className={isHighlighted ? 'row-highlight' : ''}>
                  <td>
                    <div className="user-cell">
                      <div className="avatar-img">{u.name ? u.name[0].toUpperCase() : 'U'}</div>
                      <span>{u.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${u.status ? u.status.toLowerCase() : 'active'}`}>
                      {u.status || 'Active'}
                    </span>
                  </td>
                  <td>{u.email}</td>
                  <td>{u.phone || 'N/A'}</td>
                  <td>{u.created || '12/24/24'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn-icon">
                        <Edit2 size={16} />
                      </button>
                      <button className="btn-icon" onClick={() => onDelete(u.id || u.email)}>
                        <Trash2 size={16} color="#EF4444" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
