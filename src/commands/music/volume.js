const { EmbedBuilder } = require('discord.js');
const { getLanguage, t } = require('../../handlers/languageHandler');
const { KazagumoPlayer } = require('kazagumo');

module.exports = {
    name: 'volume',
    description: 'Change the volume',
    category: 'music',
    syntax: 'volume <volume>',
    example: 'volume 50',
    parameters: ['volume'],
    paramOptional: false,
    flags: [],
    permissions: [],
    async execute(message, args) {
        try {
            const volume = parseInt(args[0]);
            if (isNaN(volume) || volume < 0 || volume > 100) {
                const language = await getLanguage(message.guild.id);
                const embed = new EmbedBuilder()
                    .setColor(process.env.ERROR_COLOR)
                    .setDescription(t('volume_invalid', language));
                return message.channel.send({ embeds: [embed] });
            }

            const player = message.client.kazagumo.players.get(message.guild.id);
            await player.setVolume(volume);

            const language = await getLanguage(message.guild.id);
            const embed = new EmbedBuilder()
                .setColor(process.env.SUCCESS_COLOR)
                .setDescription(t('volume_set', language, { volume }));
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