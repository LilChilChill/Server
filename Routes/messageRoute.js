const express = require('express');
const { sendMessage, getMessages, deleteChatHistory } = require('../Controllers/messageController');
const { authMiddleware } = require('../Controllers/userController');
const multer = require('multer');

const storage = multer.memoryStorage(); // Sử dụng bộ nhớ để lưu tệp tin tạm thời

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    
    if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error('Loại file không được chấp nhận'), false);
    }
    cb(null, true);
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn kích thước tệp tin
});

const router = express.Router();

router.post('/', authMiddleware, upload.single('file'), sendMessage); 
router.get('/:friendId', authMiddleware, getMessages); 
router.delete('/delete/:friendId', authMiddleware, deleteChatHistory); 

module.exports = router;
