const { EmbedBuilder } = require('discord.js');
const { getLanguage, t } = require('../../handlers/languageHandler');
const dbServerData = require('../../models/dbServerData');

module.exports = {
    name: 'levels lock',
    description: 'Disable leveling system',
    category: 'server',
    syntax: 'levels lock',
    example: 'levels lock',
    parameters: [],
    paramOptional: true,
    flags: [],
    permissions: ['ManageGuild'],
    async execute(message, args) {
        try {
            const language = await getLanguage(message.guild.id);
            await dbServerData.findOneAndUpdate(
                { serverId: message.guild.id },
                { levelsEnabled: false },
                { new: true, upsert: true }
            );

            const embed = new EmbedBuilder()
                .setDescription(t('levelsLock_description', language))
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