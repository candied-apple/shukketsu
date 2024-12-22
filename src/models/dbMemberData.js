const mongoose = require('mongoose');

const dbMemberDataSchema = new mongoose.Schema({
    serverId: {
        type: String,
        required: true,
        unique: true
    },
    memberId: {
        type: String,
        required: true
    },
    xp: {
        type: Number,
        default: 0
    },
    level: {
        type: Number,
        default: 1
    },
    voicemasterownedchannelid: {
        type: String,
        default: ''
    },
});

dbMemberDataSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const dbMemberData = mongoose.model('dbMemberData', dbMemberDataSchema);

module.exports = dbMemberData;