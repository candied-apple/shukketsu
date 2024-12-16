const mongoose = require('mongoose');

const dbRoleDataSchema = new mongoose.Schema({
    roleId: {
        type: String,
        required: true,
        unique: true
    },
    fakePermissions: {
        type: [String],
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

dbRoleDataSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const dbRoleData = mongoose.model('dbRoleData', dbRoleDataSchema);

module.exports = dbRoleData;