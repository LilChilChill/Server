const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    file: { data: Buffer, contentType: String },
    isRead: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
    date: {type: String},
});

module.exports = mongoose.model('Message', messageSchema);
