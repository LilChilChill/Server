const express = require('express');
const { 
    sendFriendRequest, 
    acceptFriendRequest, 
    getFriendRequests,   
    declineFriendRequest,
} = require('../Controllers/friendController');
const { authMiddleware } = require('../Controllers/userController');
const router = express.Router();

router.post('/add', authMiddleware, sendFriendRequest);
router.post('/accept/:id', authMiddleware, acceptFriendRequest);
router.get('/requests', authMiddleware, getFriendRequests); 
router.post('/decline/:id', authMiddleware, declineFriendRequest); 
module.exports = router;
