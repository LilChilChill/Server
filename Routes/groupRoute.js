const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../Controllers/userController');
const {
    createGroup,
    getUserGroups,
    sendMessage,
    getGroupMessages
} = require('../Controllers/groupController');

router.post('/create', authMiddleware, createGroup);

router.get('/:userId', authMiddleware, getUserGroups);

router.post('/:groupId/message', authMiddleware, sendMessage);

router.get('/:groupId/messages', authMiddleware, getGroupMessages);


module.exports = router;
