const { EmbedBuilder } = require('discord.js');
const { getLanguage, t } = require('../../handlers/languageHandler');

module.exports = {
    name: 'loop',
    description: 'Set the loop mode for the current music player',
    category: 'music',
    syntax: 'loop <track|queue|off>',
    example: 'loop track',
    parameters: ['mode'],
    paramOptional: false,
    flags: [],
    permissions: [],
    async execute(message, args) {
        const mode = args[0];
        const validModes = ['track', 'queue', 'off'];

        if (!validModes.includes(mode)) {
            const language = await getLanguage(message.guild.id);
            const embed = new EmbedBuilder()
                .setColor(process.env.WARNING_COLOR)
                .setDescription(t('loop_invalid_option', language));
            return message.channel.send({ embeds: [embed] });
        }

        try {
            const player = message.client.kazagumo.players.get(message.guild.id);
            if (!player) {
                const language = await getLanguage(message.guild.id);
                const embed = new EmbedBuilder()
                    .setColor(process.env.ERROR_COLOR)
                    .setDescription(t('loop_no_player', language));
                return message.channel.send({ embeds: [embed] });
            }

            switch (mode) {
                case 'track':
                    player.setLoop('track');
                    break;
                case 'queue':
                    player.setLoop('queue');
                    break;
                case 'off':
                    player.setLoop('none');
                    break;
            }

            const language = await getLanguage(message.guild.id);
            const embed = new EmbedBuilder()
                .setColor(process.env.SUCCESS_COLOR)
                .setDescription(t('loop_status_updated', language, { option: mode }));
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