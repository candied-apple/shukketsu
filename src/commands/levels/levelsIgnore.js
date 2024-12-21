const { EmbedBuilder } = require('discord.js');
const dbServerData = require('../../models/dbServerData');
const { getLanguage, t } = require('../../handlers/languageHandler');

module.exports = {
    name: 'levels ignore',
    description: 'Ignore a channel or role for XP.',
    category: 'levels',
    syntax: 'levels ignore <target>',
    example: 'levels ignore #general|@role',
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
                .setDescription(t('levelsIgnore_no_target', language));
            return message.channel.send({ embeds: [embed] });
        }

        const target = args[0];

        try {
            const serverData = await dbServerData.findOne({ serverId: guildId });

            if (!serverData) {
                const embed = new EmbedBuilder()
                    .setColor(process.env.WARNING_COLOR)
                    .setDescription(t('levelsIgnore_no_server_data', language));
                return message.channel.send({ embeds: [embed] });
            }

            if (target.startsWith('<#')) { // Channel
                const channelId = target.slice(2, -1);
                if (!serverData.levelsIgnoredChannels.includes(channelId)) {
                    serverData.levelsIgnoredChannels.push(channelId);
                }
            } else if (target.startsWith('<@&')) { // Role
                const roleId = target.slice(3, -1);
                if (!serverData.levelsIgnoredRoles.includes(roleId)) {
                    serverData.levelsIgnoredRoles.push(roleId);
                }
            } else {
                const embed = new EmbedBuilder()
                    .setColor(process.env.WARNING_COLOR)
                    .setDescription(t('levelsIgnore_invalid_target', language));
                return message.channel.send({ embeds: [embed] });
            }

            await serverData.save();

            const embed = new EmbedBuilder()
                .setColor(process.env.SUCCESS_COLOR)
                .setDescription(t('levelsIgnore_success', language, { target }));

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