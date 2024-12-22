const dbServerData = require('../models/dbServerData');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        try {
            const serverData = await dbServerData.findOne({ serverId: member.guild.id });

            if (!serverData || !serverData.autoroles || serverData.autoroles.length === 0) {
                return;
            }

            const autoroles = serverData.autoroles;
            for (const roleId of autoroles) {
                const role = member.guild.roles.cache.get(roleId);
                if (role) {
                    await member.roles.add(role);
                }
            }
        } catch (error) {
            console.error(error);
        }
    },
};