const mongoose = require('mongoose');

const dbMessageDataSchema = new mongoose.Schema({
    serverId: {
        type: String,
        required: true
    },
    channelId: {
        type: String,
        required: true
    },
    messageId: {
        type: String,
        required: true,
        unique: true
    },
    authorId: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

dbMessageDataSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const dbMessageData = mongoose.model('dbMessageData', dbMessageDataSchema);

module.exports = dbMessageData;