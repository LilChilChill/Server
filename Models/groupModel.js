const mongoose = require('mongoose');

const groupChatSchema = new mongoose.Schema({
    groupName: {
        type: String,
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    }]
});

const GroupChat = mongoose.model('GroupChat', groupChatSchema);

module.exports = GroupChat;
