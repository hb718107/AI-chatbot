import express from 'express';
import { getUsers, createDirectUser, removeUser } from '../controllers/userController.js';

const router = express.Router();

router.get('/', getUsers);
router.post('/', createDirectUser);
router.delete('/:id', removeUser);

export default router;
