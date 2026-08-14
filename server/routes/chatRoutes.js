import express from 'express';
import { handleChatMessage, fetchHistory, clearHistory } from '../controllers/chatController.js';

const router = express.Router();

router.post('/', handleChatMessage);
router.get('/history', fetchHistory);
router.delete('/history', clearHistory);

export default router;
