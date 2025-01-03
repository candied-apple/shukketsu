const { EmbedBuilder } = require('discord.js');
const { getLanguage, t } = require('../../../handlers/languageHandler');
const dbServerData = require('../../../models/dbServerData');

module.exports = {
    name: 'rss add',
    description: 'Adds an RSS feed to a specified channel.',
    category: 'rss',
    syntax: 'rss add #channel <url>',
    example: 'rss add #general https://example.com/rss',
    parameters: ['channel', 'url'],
    paramOptional: false,
    flags: [],
    permissions: ['Administrator'],
    async execute(message, args) {
        try {
            const channel = message.mentions.channels.first();
            const url = args[1];
            const language = await getLanguage(message.guild.id);
    
            if (!channel) {
                const embed = new EmbedBuilder()
                    .setDescription(t('rss_add_invalid_channel', language))
                    .setColor(process.env.WARNING_COLOR);
                return message.channel.send({ embeds: [embed] });
            }
    
            // Fetch the server data from the database
            const serverData = await dbServerData.findOne({ serverId: message.guild.id });
    
            if (!serverData) {
                const embed = new EmbedBuilder()
                    .setDescription(t('rss_add_server_data_not_found', language))
                    .setColor(process.env.WARNING_COLOR);
                return message.channel.send({ embeds: [embed] });
            }
    
            // Check if the channel already has 3 RSS feeds
            const channelFeeds = serverData.rssFeeds.filter(feed => feed.channelId === channel.id);
            if (channelFeeds.length >= 3) {
                const embed = new EmbedBuilder()
                    .setDescription(t('rss_add_channel_limit_reached', language))
                    .setColor(process.env.WARNING_COLOR);
                return message.channel.send({ embeds: [embed] });
            }
    
            // Add the RSS feed to the server data
            if (!serverData.rssFeeds) {
                serverData.rssFeeds = [];
            }
            serverData.rssFeeds.push({ channelId: channel.id, url });
    
            // Save the updated server data
            await serverData.save();
    
            const embed = new EmbedBuilder()
                .setDescription(t('rss_add_success', language, { channel: channel.name, url }))
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