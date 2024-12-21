const { EmbedBuilder } = require('discord.js');
const dbServerData = require('../../models/dbServerData');
const { getLanguage, t } = require('../../handlers/languageHandler');

module.exports = {
    name: 'levels unignore',
    description: 'Unignore a channel or role for XP.',
    category: 'levels',
    syntax: 'levels unignore <target>',
    example: 'levels unignore #general|@role',
    parameters: ['target'],
    paramOptional: false,
    flags: [],
    permissions: ['ManageGuild'],
    async execute(message, args) {
        const guildId = message.guild.id;
        const language = await getLanguage(guildId);

        if (!args[0]) {
            const embed = new EmbedBuilder()
                .setColor(process.env.WARNING_COLOR)
                .setDescription(t('levelsUnignore_no_target', language));
            return message.channel.send({ embeds: [embed] });
        }

        const target = args[0];

        try {
            const serverData = await dbServerData.findOne({ serverId: guildId });

            if (!serverData) {
                const embed = new EmbedBuilder()
                    .setColor(process.env.WARNING_COLOR)
                    .setDescription(t('levelsUnignore_no_server_data', language));
                return message.channel.send({ embeds: [embed] });
            }

            let removed = false;

            if (target.startsWith('<#')) { // Channel
                const channelId = target.slice(2, -1);
                const index = serverData.levelsIgnoredChannels.indexOf(channelId);
                if (index > -1) {
                    serverData.levelsIgnoredChannels.splice(index, 1);
                    removed = true;
                }
            } else if (target.startsWith('<@&')) { // Role
                const roleId = target.slice(3, -1);
                const index = serverData.levelsIgnoredRoles.indexOf(roleId);
                if (index > -1) {
                    serverData.levelsIgnoredRoles.splice(index, 1);
                    removed = true;
                }
            } else {
                const embed = new EmbedBuilder()
                    .setColor(process.env.WARNING_COLOR)
                    .setDescription(t('levelsUnignore_invalid_target', language));
                return message.channel.send({ embeds: [embed] });
            }

            if (!removed) {
                const embed = new EmbedBuilder()
                    .setColor(process.env.WARNING_COLOR)
                    .setDescription(t('levelsUnignore_not_ignored', language));
                return message.channel.send({ embeds: [embed] });
            }

            await serverData.save();

            const embed = new EmbedBuilder()
                .setColor(process.env.SUCCESS_COLOR)
                .setDescription(t('levelsUnignore_success', language, { target }));

            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            const embed = new EmbedBuilder()
                .setColor(process.env.ERROR_COLOR)
                .setDescription(t('global_error_description', language));
            message.channel.send({ embeds: [embed] });
        }
    },
};