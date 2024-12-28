const { EmbedBuilder } = require('discord.js');
const dbServerData = require('../../models/dbServerData');
const { getLanguage, t } = require('../../handlers/languageHandler');

module.exports = {
    name: 'autorole reset',
    description: 'Clears every autorole for the guild.',
    category: 'server',
    syntax: 'autorole reset',
    example: 'autorole reset',
    parameters: [],
    paramOptional: false,
    flags: [],
    permissions: ['ManageGuild'],
    async execute(message) {
        try {
            const serverData = await dbServerData.findOne({ serverId: message.guild.id });
            if (!serverData) {
                return message.channel.send('Server data not found.');
            }

            serverData.autoroles = [];
            await serverData.save();

            const language = await getLanguage(message.guild.id);
            const embed = new EmbedBuilder()
                .setColor(process.env.SUCCESS_COLOR)
                .setDescription(t('autorole_reset_success', language));

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