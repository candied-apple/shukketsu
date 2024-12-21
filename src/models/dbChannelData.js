const mongoose = require('mongoose');

const dbChannelDataSchema = new mongoose.Schema({
    serverId: {
        type: String,
        required: true
    },
    channelId: {
        type: String,
        required: true,
        unique: true
    },
});

dbChannelDataSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const dbChannelData = mongoose.model('dbChannelData', dbChannelDataSchema);

module.exports = dbChannelData;