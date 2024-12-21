const { EmbedBuilder } = require('discord.js');
const { getLanguage, t } = require('../../handlers/languageHandler');
const dbServerData = require('../../models/dbServerData');

module.exports = {
    name: 'levels remove',
    description: 'Remove level role',
    category: 'levels',
    syntax: 'levels remove <rank>',
    example: 'levels remove 10',
    parameters: ['rank'],
    paramOptional: false,
    flags: [],
    permissions: ['ManageGuild'],
    async execute(message, args) {
        try {
            const language = await getLanguage(message.guild.id);
            const rank = parseInt(args[0]);

            const serverData = await dbServerData.findOne({ serverId: message.guild.id });
            const roleId = [...serverData.levelRoles.entries()].find(([key, value]) => value === rank)?.[0];

            if (!roleId) {
                return message.channel.send(t('levelsRemove_not_found', language));
            }

            serverData.levelRoles.delete(roleId);
            await serverData.save();

            const embed = new EmbedBuilder()
                .setDescription(t('levelsRemove_success', language, { rank }))
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