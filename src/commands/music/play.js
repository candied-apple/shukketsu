const { EmbedBuilder } = require('discord.js');
const { getLanguage, t } = require('../../handlers/languageHandler');

module.exports = {
    name: 'play',
    description: 'Play a song from YouTube',
    category: 'music',
    syntax: 'play <song>',
    example: 'play Never Gonna Give You Up',
    parameters: ['song'],
    paramOptional: false,
    flags: [],
    permissions: [],
    async execute(message, args) {
        const language = await getLanguage(message.guild.id);
        const query = args.join(' ');
        if (!query) {
            const embed = new EmbedBuilder()
                .setColor(process.env.WARNING_COLOR)
                .setDescription(t('play_no_query', language));
            return message.channel.send({ embeds: [embed] });
        }

        const { channel } = message.member.voice;
        if (!channel) {
            const embed = new EmbedBuilder()
                .setColor(process.env.WARNING_COLOR)
                .setDescription(t('play_no_voice_channel', language));
            return message.channel.send({ embeds: [embed] });
        }

        try {
            const player = await message.client.kazagumo.createPlayer({
                guildId: message.guild.id,
                textId: message.channel.id,
                voiceId: channel.id,
                volume: 40
            });

            const result = await message.client.kazagumo.search(query, { requester: message.author });
            if (!result.tracks.length) {
                const embed = new EmbedBuilder()
                    .setColor(process.env.WARNING_COLOR)
                    .setDescription(t('play_no_results', language));
                return message.channel.send({ embeds: [embed] });
            }

            if (result.type === 'PLAYLIST') player.queue.add(result.tracks);
            else player.queue.add(result.tracks[0]);

            if (!player.playing && !player.paused) player.play();
            const embed = new EmbedBuilder()
                .setColor(process.env.DEFAULT_COLOR)
                .setDescription(result.type === 'PLAYLIST' ? t('play_playlist_queued', language, { count: result.tracks.length, name: result.playlistName }) : t('play_song_queued', language, { title: result.tracks[0].title }));
            return message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            const embed = new EmbedBuilder()
                .setColor(process.env.ERROR_COLOR)
                .setDescription(t('global_error_description', language));
            return message.channel.send({ embeds: [embed] });
        }
    }
};