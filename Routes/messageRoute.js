const express = require('express');
const { sendMessage, getMessages } = require('../Controllers/messageController');
const { authMiddleware } = require('../Controllers/userController');

const router = express.Router();

router.post('/', authMiddleware, sendMessage); // Route để gửi tin nhắn
router.get('/:friendId', authMiddleware, getMessages); // Route để lấy tin nhắn giữa hai người

module.exports = router;
