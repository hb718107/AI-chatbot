import { getAllUsers, addUser, deleteUserByEmail } from '../services/userService.js';

export const getUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createDirectUser = async (req, res) => {
  try {
    const user = await addUser(req.body);
    const users = await getAllUsers();
    res.json({ user, users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const removeUser = async (req, res) => {
  try {
    await deleteUserByEmail(req.params.id);
    const users = await getAllUsers();
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
