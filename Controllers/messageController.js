const Message = require('../Models/messageModel');
const fs = require('fs');
const path = require('path');

const sendMessage = async (req, res) => {
    const { receiverId, content } = req.body; 
    const senderId = req.user._id;

    if (!receiverId) {
        return res.status(400).json({ message: 'receiverId là bắt buộc' });
    }

    let fileData = null;

    // Kiểm tra nếu có tệp tin
    if (req.file) {
        fileData = {
            data: req.file.buffer, // Sử dụng buffer trực tiếp
            contentType: req.file.mimetype
        };
    }

    try {
        const messageData = new Message({
            sender: senderId,
            receiver: receiverId,
            content: content || '', 
            file: fileData 
        });

        if (content || fileData) {
            await messageData.save(); 
            // Trả về dữ liệu tin nhắn đã gửi, bao gồm tệp nếu có
            res.status(200).json({ message: 'Tin nhắn đã được gửi thành công', messageData: {
                content: messageData.content,
                file: fileData // Chuyển đổi tệp tin về dạng base64 sau này
            }});
        } else {
            return res.status(400).json({ message: 'Không có nội dung để gửi' });
        }
    } catch (error) {
        console.error('Lỗi:', error);
        res.status(500).json({ message: 'Có lỗi xảy ra', error: error.message });
    }
};


const getMessages = async (req, res) => {
    const userId = req.user._id;
    const friendId = req.params.friendId;
    const limit = parseInt(req.query.limit) || 20; // Số tin nhắn tối đa mỗi lần
    const page = parseInt(req.query.page) || 1; // Trang hiện tại
    const skip = (page - 1) * limit;

    try {
        const messages = await Message.find({
            $or: [
                { sender: userId, receiver: friendId },
                { sender: friendId, receiver: userId }
            ]
        })
        .sort('timestamp')
        .skip(skip)
        .limit(limit)
        .select('sender receiver content file timestamp'); // Chỉ lấy các trường cần thiết

        const formattedMessages = messages.map(message => {
            if (message.file && message.file.data) {
                return {
                    ...message.toObject(),
                    file: {
                        data: message.file.data.toString('base64'), 
                        contentType: message.file.contentType
                    }
                };
            }
            return message;
        });

        res.status(200).json(formattedMessages);
    } catch (error) {
        res.status(500).json({ message: 'Có lỗi xảy ra khi lấy tin nhắn', error: error.message });
    }
};



const deleteChatHistory = async (req, res) => {
    try {
        const { friendId } = req.params;
        const userId = req.user._id;

        const result = await Message.deleteMany({
            $or: [
                { sender: userId, receiver: friendId },
                { sender: friendId, receiver: userId }
            ]
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Không có tin nhắn nào để xóa' });
        }

        res.status(200).json({ message: 'Lịch sử chat đã được xóa', deletedCount: result.deletedCount });
    } catch (error) {
        console.error('Lỗi khi xóa lịch sử chat:', error);
        res.status(500).json({ message: 'Lỗi khi xóa lịch sử chat', error: error.message });
    }
};

module.exports = { sendMessage, getMessages, deleteChatHistory };
