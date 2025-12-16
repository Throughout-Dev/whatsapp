// models/messageLog.js
const mongoose = require('mongoose');

const MessageLogSchema = new mongoose.Schema({
    fromNumber: {
      type: String,
      required: true
    },
    contactNumber: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['success', 'failed'],
        required: true,
    },
}, { timestamps: true }); // timestamps adds createdAt and updatedAt fields

module.exports = mongoose.model('MessageLog', MessageLogSchema);