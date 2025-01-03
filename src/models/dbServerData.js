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
    welcomeMessages: [{
        channelId: String,
        message: String,
        selfDestruct: Number,
    }],
    goodbyeMessages: [{
        channelId: String,
        message: String,
        selfDestruct: Number,
    }],
    boostMessages: [{
        channelId: String,
        message: String,
        selfDestruct: Number,
    }],
    xpMultiplier: {
        type: Number,
        default: 1
    },
    levelsIgnoredChannels: {
        type: [String],
        default: []
    },
    levelsIgnoredRoles: {
        type: [String],
        default: []
    },
    levelsEnabled: {
        type: Boolean,
        default: true
    },
    levelsMessage: {
        type: String,
        default: 'Congratulations {member}, you have leveled up to level {level}!'
    },
    levelsMessageMode: {
        type: String,
        default: 'context'
    },
    levelsMessageChannel: {
        type: String,
        default: null
    },
    levelRoles: {
        type: Map,
        of: Number,
        default: {}
    },
    levelStackroles: {
        type: Boolean,
        default: true
    },
    voicemasterchannelid: {
        type: String,
        default: null
    },
    voicemastercategoryid: {
        type: String,
        default: null
    },
    voicemasterinterfaceid: {
        type: String,
        default: null
    },
    autoroles: {
        type: [String],
        default: []
    },
    rssFeeds: [{
        channelId: String,
        url: String
    }],
});

dbServerDataSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const dbServerData = mongoose.model('dbServerData', dbServerDataSchema);

module.exports = dbServerData;