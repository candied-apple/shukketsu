const mongoose = require('mongoose');

const dbServerDataSchema = new mongoose.Schema({
    serverId: {
        type: String,
        required: true,
        unique: true
    },
    prefix: {
        type: String,
        default: '!'
    },
    language: {
        type: String,
        default: 'en'
    },
    aliases: {
        type: Map,
        of: [String],
        default: {},
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

dbServerDataSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const dbServerData = mongoose.model('dbServerData', dbServerDataSchema);

module.exports = dbServerData;