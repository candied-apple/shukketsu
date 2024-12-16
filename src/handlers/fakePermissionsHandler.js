const dbRoleData = require('../models/dbRoleData');

async function hasFakePermission(member, permission) {
    const roles = member.roles.cache;
    for (const role of roles.values()) {
        const roleData = await dbRoleData.findOne({ roleId: role.id });
        if (roleData && roleData.fakePermissions.includes(permission)) {
            return true;
        }
    }
    return false;
}

module.exports = {
    hasFakePermission
};