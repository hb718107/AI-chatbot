import { registerAdmin, verifyAdmin } from '../services/authService.js';

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await verifyAdmin(username, password);
    if (!admin) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    res.json({ success: true, token: `token_${admin.id}_${Date.now()}`, username: admin.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const signup = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    const newAdmin = await registerAdmin(username, password);
    res.json({ success: true, token: `token_${newAdmin.id}_${Date.now()}`, username: newAdmin.username });
  } catch (err) {
    res.status(400).json({ error: err.message.includes('UNIQUE') ? 'Username already exists' : err.message });
  }
};
