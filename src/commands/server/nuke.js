const { EmbedBuilder } = require('discord.js');
const { getLanguage, t } = require('../../handlers/languageHandler');

module.exports = {
    name: 'nuke',
    description: 'Clones the current channel, deletes the old channel, and sends a message to the new channel.',
    category: 'server',
    syntax: 'nuke',
    example: 'nuke',
    parameters: [],
    paramOptional: true,
    flags: [],
    permissions: ['ManageGuild'],
    async execute(message, args) {
        try {
            const language = await getLanguage(message.guild.id);
            const oldChannel = message.channel;

            // Clone the channel
            const newChannel = await oldChannel.clone();

            // Delete the old channel
            await oldChannel.delete();

            // Get bot's profile photo
            const botProfilePhoto = message.client.user.displayAvatarURL();

            // Send a message to the new channel
            const embed = new EmbedBuilder()
                .setDescription(t('nuke_channel_cloned', language))
                .setColor(process.env.DEFAULT_COLOR)
                .setImage(botProfilePhoto)
                .setFooter({
                    text: `${message.author.username}`,
                    iconURL: message.author.displayAvatarURL(),
                })
                .setTimestamp();

            newChannel.send({ embeds: [embed] });
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