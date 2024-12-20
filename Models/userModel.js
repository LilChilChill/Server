const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    birthDate: { type: Date, default: null },
    gender: {
        type: String,
        enum: ['Nam', 'Nữ', 'Khác', 'male', 'female', 'other'],
        default: null,
    },
    avatar: { 
        data: Buffer, 
        contentType: String 
    },
    friends: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

