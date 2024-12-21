const mongoose = require('mongoose');

const dbRoleDataSchema = new mongoose.Schema({
    serverId: {
        type: String,
        required: true,
        unique: true
    },
    roleId: {
        type: String,
        required: true,
    },
    fakePermissions: {
        type: [String],
        default: []
    },
});

dbRoleDataSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const dbRoleData = mongoose.model('dbRoleData', dbRoleDataSchema);

module.exports = dbRoleData;