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
const path = require('path');
const fsPromises = require('fs').promises;

const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const userId = req.user._id.toString();
        const userDir = path.join(__dirname, '../uploads/Avatars', userId);

        try {
            await fsPromises.mkdir(userDir, { recursive: true });
            cb(null, userDir);
        } catch (error) {
            console.error('Error creating user directory:', error);
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|gif/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);

        if (extname && mimetype) {
            cb(null, 'avatar.png');
        } else {
            cb(new Error('Định dạng file không hợp lệ.'));
        }
    },
});

const upload = multer({ storage });

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
