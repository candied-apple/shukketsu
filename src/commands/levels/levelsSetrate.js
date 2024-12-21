const { EmbedBuilder } = require('discord.js');
const dbServerData = require('../../models/dbServerData');
const { getLanguage, t } = require('../../handlers/languageHandler');

module.exports = {
    name: 'levels setrate',
    description: 'Set multiplier for XP gain.',
    category: 'levels',
    syntax: 'levels setrate <multiplier>',
    example: 'levels setrate 2',
    parameters: ['multiplier'],
    permissions: ['ManageGuild'],
    async execute(message, args) {

        const multiplier = parseFloat(args[0]);
        if (isNaN(multiplier) || multiplier <= 0) {
            const language = await getLanguage(message.guild.id);
            const embed = new EmbedBuilder()
            .setColor(process.env.WARNING_COLOR)
            .setDescription(t('levels_set_rate_invalid_multiplier', language));
            return message.channel.send({ embeds: [embed] });
        }

        try {
            const serverId = message.guild.id;
            let serverData = await dbServerData.findOne({ serverId });

            if (!serverData) {
                serverData = new dbServerData({ serverId });
            }

            serverData.xpMultiplier = multiplier;
            await serverData.save();

            const language = await getLanguage(message.guild.id);
            const embed = new EmbedBuilder()
                .setColor(process.env.SUCCESS_COLOR)
                .setDescription(t('levels_set_rate_xp_multiplier_set', language, { multiplier }));

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