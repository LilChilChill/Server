const message = require('../Models/messageModel');

// Gửi tin nhắn
const sendMessage = async (req, res) => {
    const { receiverId, content } = req.body; // Đảm bảo nhận receiverId từ body
    const senderId = req.user._id;

    try {
        const messageData = new message({
            sender: senderId,
            receiver: receiverId, // Sử dụng receiverId từ body
            content
        });

        await messageData.save(); // Lưu tin nhắn

        res.status(200).json({ message: 'Tin nhắn đã được gửi thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Có lỗi xảy ra nè', error: error.message });
        console.log(error); // In ra lỗi để kiểm tra
    }
};

// Lấy tin nhắn giữa hai người dùng
const getMessages = async (req, res) => {
    const userId = req.user._id;
    const friendId = req.params.friendId;

    try {
        const messages = await message.find({
            $or: [
                { sender: userId, receiver: friendId },
                { sender: friendId, receiver: userId }
            ]
        }).sort('timestamp');

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Có lỗi xảy ra khi lấy tin nhắn', error: error.message });
    }
};

module.exports = { sendMessage, getMessages };
