const FriendRequest = require('../Models/friendRequestModel');
const User = require('../Models/userModel');


const sendFriendRequest = async (req, res) => {
    const { receiverId } = req.body;  
    const senderId = req.user._id;

    try {
        
        const existingRequest = await FriendRequest.findOne({ sender: senderId, receiver: receiverId });
        if (existingRequest) {
            return res.status(400).json({ message: 'Lời mời đã được gửi' });
        }

        
        const sender = await User.findById(senderId);
        if (sender.friends.includes(receiverId)) {
            return res.status(400).json({ message: 'Bạn đã là bạn bè với người dùng này.' });
        }

        
        const friendRequest = new FriendRequest({
            sender: senderId,
            receiver: receiverId,
        });

        await friendRequest.save();
        res.status(201).json({ message: 'Lời mời kết bạn đã được gửi' });
    } catch (err) {
        console.error('Error sending friend request:', err);
        res.status(500).json({ message: 'Có lỗi xảy ra khi gửi lời mời' });
    }
};


const acceptFriendRequest = async (req, res) => {
    const { id } = req.params;  
    const userId = req.user._id;

    try {
        
        const friendRequest = await FriendRequest.findOne({ _id: id, receiver: userId, status: 'pending' });

        if (!friendRequest) {
            return res.status(404).json({ message: 'Lời mời kết bạn không tồn tại' });
        }

        
        friendRequest.status = 'accepted';
        await friendRequest.save();

        
        const sender = await User.findById(friendRequest.sender);
        const receiver = await User.findById(friendRequest.receiver);

        if (!sender || !receiver) {
            return res.status(404).json({ message: 'Người dùng không tồn tại.' });
        }

        
        if (!sender.friends.includes(receiver._id)) {
            sender.friends.push(receiver._id);
            await sender.save();
        }

        if (!receiver.friends.includes(sender._id)) {
            receiver.friends.push(sender._id);
            await receiver.save();
        }

        res.status(200).json({ message: 'Đã chấp nhận lời mời kết bạn' });
    } catch (err) {
        console.error('Error accepting friend request:', err);
        res.status(500).json({ message: 'Có lỗi xảy ra khi chấp nhận lời mời' });
    }
};


const getFriendRequests = async (req, res) => {
    const userId = req.user._id;

    try {
        const friendRequests = await FriendRequest.find({ receiver: userId, status: 'pending' }).populate('sender', 'name');
        res.status(200).json(friendRequests);
    } catch (err) {
        console.error('Error fetching friend requests:', err);
        res.status(500).json({ message: 'Có lỗi xảy ra khi lấy danh sách lời mời' });
    }
};


const declineFriendRequest = async (req, res) => {
    const { id } = req.params;  
    const userId = req.user._id;

    try {
        
        const friendRequest = await FriendRequest.findOne({ _id: id, receiver: userId, status: 'pending' });

        if (!friendRequest) {
            return res.status(404).json({ message: 'Lời mời kết bạn không tồn tại' });
        }

        
        friendRequest.status = 'declined';
        await friendRequest.save();

        res.status(200).json({ message: 'Đã từ chối lời mời kết bạn' });
    } catch (err) {
        console.error('Error declining friend request:', err);
        res.status(500).json({ message: 'Có lỗi xảy ra khi từ chối lời mời' });
    }
};

module.exports = {
    sendFriendRequest,
    acceptFriendRequest,
    getFriendRequests,
    declineFriendRequest,
};
