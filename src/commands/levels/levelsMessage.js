const { EmbedBuilder } = require('discord.js');
const dbServerData = require('../../models/dbServerData');
const { getLanguage, t } = require('../../handlers/languageHandler');

module.exports = {
    name: 'levels message',
    description: 'Set a custom level-up message.',
    category: 'levels',
    syntax: 'levels message <text>',
    example: 'levels message Congratulations {member}, you have leveled up to level {level}!',
    parameters: ['text'],
    paramOptional: false,
    flags: [],
    permissions: ['ManageGuild'],
    async execute(message, args) {
        try {

            const customMessage = args.join(' ');
            const serverId = message.guild.id;

            await dbServerData.findOneAndUpdate(
                { serverId },
                { levelsMessage: customMessage },
                { new: true, upsert: true }
            );

            const language = await getLanguage(serverId);
            const embed = new EmbedBuilder()
                .setDescription(t('levelsMessage_updated', language))
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