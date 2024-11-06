const express = require('express');
const {
    registerUser,
    loginUser,
    getUserProfile,
    updateUser,
    getUsers,
    searchUsers,
    authMiddleware,
    getFriends,
    removeFriend
} = require('../Controllers/userController');

const multer = require('multer');

const storage = multer.memoryStorage(); 
const fileFilter = (req, avatar, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(avatar.mimetype)) {
        return cb(new Error('Loại file không được chấp nhận'), false);
    }
    cb(null, true);
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

const router = express.Router();
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', authMiddleware, getUserProfile);
router.put('/update', authMiddleware, upload.single('avatar'), updateUser);
router.get('/', authMiddleware, getUsers);
router.get('/search', authMiddleware, searchUsers);
router.get('/friends', authMiddleware, getFriends); 
router.delete('/friends/:friendId', authMiddleware, removeFriend);

module.exports = router;
