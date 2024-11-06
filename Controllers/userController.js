const userModel = require('../Models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const fs = require('fs');
const path = require('path'); 
const fsPromises = require('fs').promises;
const FriendRequest = require('../Models/friendRequestModel'); 


const createToken = (_id) => {
    const jwtkey = process.env.JWT_SECRET_KEY;
    return jwt.sign({ _id }, jwtkey, { expiresIn: "3d" });
};


const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Chưa được xác thực!' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = { _id: decoded._id }; 
        next();  
    } catch (error) {
        return res.status(401).json({ message: 'Token không hợp lệ!' });
    }
};


const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        let user = await userModel.findOne({ email });
        if (user) return res.status(400).json("Người dùng đã tồn tại.");

        if (!name || !email || !password) return res.status(400).json("Vui lòng nhập đầy đủ thông tin.");
        if (!validator.isEmail(email)) return res.status(400).json("Email không hợp lệ.");
        if (!validator.isStrongPassword(password)) return res.status(400).json("Mật khẩu không đủ mạnh.");
        if (name.length < 3) return res.status(400).json("Tên người dùng quá ngắn.");

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new userModel({ name, email, password: hashedPassword });
        await user.save();

        const token = createToken(user._id);
        res.status(200).json({ _id: user._id, name, email, token });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
    }
};


const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await userModel.findOne({ email });
        if (!user) return res.status(400).json('Người dùng không tồn tại.');

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) return res.status(400).json('Kiểm tra lại email hoặc mật khẩu.');

        const token = createToken(user._id);
        res.status(200).json({ _id: user._id, name: user.name, email, token });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
    }
};


// const getUserProfile = async (req, res) => {
//     try {
//         const user = await userModel.findById(req.user._id).select('-password -friends');
//         if (!user) return res.status(404).json('Người dùng không tồn tại.');

//         // if (user.avatar && user.avatar.data) {
//         //     avatar = {
//         //         data: user.avatar.data.toString('base64'),  
//         //         contentType: user.avatar.contentType,
//         //     };
//         // }

//         // const userProfile = user.map(users => {
//         //     const userObj = user.toObject()
//         //     if(user.avatar && user.avatar.data ){
//         //         userObj.avatar = {
//         //             data: userObj.avatar.data.toString('base64'),
//         //             contentType: userObj.avatar.contentType,
//         //         };
//         //     }
//         //     return userObj;
//         // })

//         res.status(200).json(user);
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
//     }
// };

const getUserProfile = async (req, res) => {
    try {
        const user = await userModel.findById(req.user._id).select('-password -friends');
        if (!user) return res.status(404).json('Người dùng không tồn tại.');

        const userProfile = user.toObject();
        
        if (userProfile.avatar && userProfile.avatar.data) {
            userProfile.avatar = {
                data: userProfile.avatar.data.toString('base64'),
                contentType: userProfile.avatar.contentType,
            };
        }

        res.status(200).json(userProfile);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
    }
};



const updateUser = async (req, res) => {
    const userId = req.user._id;
    const { name, birthDate, gender } = req.body;
    const newAvatar = req.file

    try {
        const user = await userModel.findById(userId);
        if (!user) return res.status(404).json('Người dùng không tồn tại.');

        const updateFields = {};
        if (name && name.length >= 3) updateFields.name = name; 
        if (birthDate) updateFields.birthDate = birthDate; 
        if (gender) updateFields.gender = gender; 

        if (newAvatar) {
            updateFields.avatar = {
                data: newAvatar.buffer,
                contentType: newAvatar.mimetype,
            };
        }

        const updatedUser = await userModel.findByIdAndUpdate(
            userId, 
            updateFields, 
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Lỗi khi cập nhật người dùng:', error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi cập nhật thông tin.", error: error.message });
    }
};



const getUsers = async (req, res) => {
    try {
        const users = await userModel.find().select('-password');
        res.status(200).json(users);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
    }
};


const searchUsers = async (req, res) => {
    const { query } = req.query;
    try {
        const users = await userModel.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ]
        }).select('-password -friends'); 

        res.status(200).json(users);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi tìm kiếm người dùng.', error: error.message });
    }
};


const getFriends = async (req, res) => {
    const userId = req.user._id;

    try {
        const user = await userModel.findById(userId).populate('friends', 'name avatar');

        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        const friends = user.friends.map(friend => {
            const friendObj = friend.toObject();
            if (friend.avatar && friend.avatar.data) {
                friendObj.avatar = {
                    data: friend.avatar.data.toString('base64'), 
                    contentType: friend.avatar.contentType
                };
            }
            return friendObj;
        });

        res.status(200).json(friends); 
    } catch (err) {
        console.error('Lỗi khi lấy danh sách bạn bè:', err); 
        res.status(500).json({ message: 'Có lỗi xảy ra khi lấy danh sách bạn bè' });
    }
};


const removeFriend = async (req, res) => {
    const friendId = req.params.friendId; 
    const userId = req.user._id; 

    try {
    
        const user = await userModel.findById(userId);

        if (!user) {
            console.log('User not found with ID:', userId);
            return res.status(404).json({ message: 'Người dùng không tồn tại.' });
        }

    
        user.friends = user.friends.filter(friend => friend.toString() !== friendId);
        await user.save();

    
        const friend = await userModel.findById(friendId);

        if (friend) {
        
            friend.friends = friend.friends.filter(friend => friend.toString() !== userId);
            await friend.save();
        }

        res.status(200).json({ message: 'Đã xóa bạn thành công.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Có lỗi xảy ra khi xóa bạn bè.' });
    }
};



module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUser,
    getUsers,
    searchUsers,
    authMiddleware,
    getFriends,
    removeFriend
};

