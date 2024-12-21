const { getLanguage, t } = require('../../handlers/languageHandler');
const dbMemberData = require('../../models/dbMemberData');
const dbServerData = require('../../models/dbServerData');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'levels sync',
    description: 'Update your members level roles',
    category: 'levels',
    syntax: 'levels sync',
    example: 'levels sync',
    parameters: [],
    paramOptional: true,
    flags: [],
    permissions: ['ManageGuild'],
    async execute(message, args) {
        try {
            const serverId = message.guild.id;
            const serverData = await dbServerData.findOne({ serverId });

            if (!serverData) {
                return message.channel.send('Server data not found.');
            }

            const members = await message.guild.members.fetch();
            for (const member of members.values()) {
                const memberData = await dbMemberData.findOne({ serverId, memberId: member.id });

                if (!memberData) continue;

                let highestRoleId = null;
                let highestLevel = 0;

                for (const [roleId, level] of serverData.levelRoles.entries()) {
                    if (memberData.level >= level) {
                        if (!highestRoleId || level > highestLevel) {
                            highestRoleId = roleId;
                            highestLevel = level;
                        }
                        if (serverData.levelStackroles) {
                            await member.roles.add(roleId);
                        }
                    }
                }

                if (highestRoleId && !serverData.levelStackroles) {
                    await member.roles.add(highestRoleId);

                    // Remove all other level roles if stacking is disabled
                    for (const [roleId, level] of serverData.levelRoles.entries()) {
                        if (roleId !== highestRoleId && member.roles.cache.has(roleId)) {
                            await member.roles.remove(roleId);
                        }
                    }
                }
            }

            const language = await getLanguage(serverId);
            const embed = new EmbedBuilder()
                .setDescription(t('levelsSync_success', language))
                .setColor(process.env.SUCCESS_COLOR);

            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            const language = await getLanguage(message.guild.id);
            const embed = new EmbedBuilder()
                .setColor(process.env.ERROR_COLOR)
                .setDescription(t('global_error_description', language));
            message.channel.send({ embeds: [embed] });
        }
    },
};