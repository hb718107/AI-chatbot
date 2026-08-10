const API_BASE = 'http://localhost:5000/api';

export const fetchUsers = async () => {
  const res = await fetch(`${API_BASE}/users`);
  return res.json();
};

export const sendChatMessage = async (message) => {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  return res.json();
};

export const fetchChatHistory = async () => {
  const res = await fetch(`${API_BASE}/chat/history`);
  return res.json();
};

export const deleteUserDirect = async (id) => {
  const res = await fetch(`${API_BASE}/users/${id}`, { method: 'DELETE' });
  return res.json();
};
