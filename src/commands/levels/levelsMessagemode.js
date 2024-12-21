const { getLanguage, t } = require('../../handlers/languageHandler');
const dbServerData = require('../../models/dbServerData');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'levels messagemode',
    description: 'Set up where level up messages will be sent.',
    category: 'levels',
    syntax: 'levels messagemode <context|none|channel>',
    example: 'levels messagemode context',
    parameters: ['mode'],
    paramOptional: false,
    flags: [],
    permissions: ['ManageGuild'],
    async execute(message, args) {
        const mode = args[0];
        const validModes = ['context', 'none'];

        if (!validModes.includes(mode) && !message.mentions.channels.first()) {
            const language = await getLanguage(message.guild.id);
            const embed = new EmbedBuilder()
                .setColor(process.env.WARNING_COLOR)
                .setDescription(t('levelsMessagemode_invalid', language, { modes: `${validModes.join(', ')}, or mention a channel` }));
            return message.channel.send({ embeds: [embed] });
        }

        try {
            const serverId = message.guild.id;
            let serverData = await dbServerData.findOne({ serverId });

            if (!serverData) {
                serverData = new dbServerData({ serverId });
            }

            if (message.mentions.channels.first()) {
                serverData.levelsMessageMode = 'channel';
                serverData.levelsMessageChannel = message.mentions.channels.first().id;
            } else {
                serverData.levelsMessageMode = mode;
                serverData.levelsMessageChannel = null;
            }

            await serverData.save();

            const language = await getLanguage(serverId);
            const embed = new EmbedBuilder()
                .setColor(process.env.SUCCESS_COLOR)
                .setDescription(t('levelsMessagemode_success', language, { mode: mode === 'channel' ? message.mentions.channels.first().toString() : mode }));
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