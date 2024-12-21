const mongoose = require('mongoose');

const dbUserDataSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    levelsMessagesEnabled: {
        type: Boolean,
        default: true
    },
});

dbUserDataSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const dbUserData = mongoose.model('dbUserData', dbUserDataSchema);

module.exports = dbUserData;