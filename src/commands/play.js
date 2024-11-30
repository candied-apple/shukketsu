const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'play',
    description: 'Play a song in your voice channel',
    async execute(message, args) {
        if (!args.length) {
            return message.reply('Please provide a song to play!');
        }

        const { voice } = message.member;
        if (!voice.channelId) {
            return message.reply('You need to be in a voice channel!');
        }

        try {
            const player = message.client.lavalink.createPlayer({
                guildId: message.guild.id,
                voiceChannelId: voice.channelId,
                textChannelId: message.channel.id,
                selfDeaf: true
            });

            if (!player.connected) await player.connect();

            const query = args.join(' ');
            const searchResult = await player.search(query, { requester: message.author });

            if (searchResult.loadType === "error") {
                return message.reply("An error occurred while searching!");
            }

            if (searchResult.loadType === "empty") {
                return message.reply("No results found!");
            }

            const track = searchResult.tracks[0];
            console.log('Track:', track);
            
            if (!track) {
                return message.reply("Could not find any tracks!");
            }

            player.queue.add(track);

            const embed = new EmbedBuilder()
                .setColor(process.env.THEME)
                .setTitle('Added to Queue')
                .addFields(
                    { name: 'Track', value: await track.info.title || 'Unknown Title' },
                    { name: 'Author', value: await track.info.author || 'Unknown Artist' },
                    { name: 'Duration', value: formatDuration(track.duration) },
                    { name: 'Position in Queue', value: `${player.queue.size}` }
                );

            await message.channel.send({ embeds: [embed] });

            if (!player.playing) {
                await player.play()
                    .catch(error => {
                        console.error('Play error:', error);
                        message.channel.send('Failed to play the track!');
                    });
            }

        } catch (error) {
            console.error('Command error:', error);
            message.reply('An error occurred while trying to play the song!');
        }
    }
};

function formatDuration(duration) {
    if (!duration) return 'Unknown';
    
    const seconds = Math.floor((duration / 1000) % 60);
    const minutes = Math.floor((duration / (1000 * 60)) % 60);
    const hours = Math.floor(duration / (1000 * 60 * 60));

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}