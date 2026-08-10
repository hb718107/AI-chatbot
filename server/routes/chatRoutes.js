import express from 'express';
import { handleChatMessage, fetchHistory } from '../controllers/chatController.js';

const router = express.Router();

router.post('/', handleChatMessage);
router.get('/history', fetchHistory);

export default router;
