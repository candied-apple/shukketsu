const { EmbedBuilder } = require('discord.js');
const { getLanguage, t } = require('../../../handlers/languageHandler');
const dbServerData = require('../../../models/dbServerData');

module.exports = {
    name: 'rss remove',
    description: 'Removes an RSS feed from a specified channel.',
    category: 'rss',
    syntax: 'rss remove #channel <url>',
    example: 'rss remove #general https://example.com/rss',
    parameters: ['channel', 'url'],
    paramOptional: false,
    flags: [],
    permissions: ['Administrator'],
    async execute(message, args) {
        try {
            const language = await getLanguage(message.guild.id);

            const channel = message.mentions.channels.first();
            const url = args[1];

            if (!channel) {
                const embed = new EmbedBuilder()
                    .setDescription(t('rss_remove_invalid_channel', language))
                    .setColor(process.env.WARNING_COLOR);
                return message.channel.send({ embeds: [embed] });
            }

            // Fetch the server data from the database
            const serverData = await dbServerData.findOne({ serverId: message.guild.id });

            if (!serverData) {
                const embed = new EmbedBuilder()
                    .setDescription(t('rss_remove_server_data_not_found', language))
                    .setColor(process.env.WARNING_COLOR);
                return message.channel.send({ embeds: [embed] });
            }

            // Remove the RSS feed from the server data
            serverData.rssFeeds = serverData.rssFeeds.filter(feed => feed.channelId !== channel.id || feed.url !== url);

            // Save the updated server data
            await serverData.save();

            const embed = new EmbedBuilder()
                .setDescription(t('rss_remove_success', language, { channel: channel.name, url }))
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