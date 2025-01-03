const axios = require('axios');
const RSSParser = require('rss-parser');
const dbServerData = require('../models/dbServerData');
const { EmbedBuilder } = require('discord.js');

const parser = new RSSParser();

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        async function fetchRSSFeeds() {
            try {
                const serverDataList = await dbServerData.find({ rssFeeds: { $exists: true, $not: { $size: 0 } } });

                for (const serverData of serverDataList) {
                    for (const feed of serverData.rssFeeds) {
                        const { channelId, url } = feed;

                        try {
                            const response = await axios.get(url);
                            const feedData = await parser.parseString(response.data);

                            const channel = client.channels.cache.get(channelId);
                            if (!channel) continue;

                            const latestItem = feedData.items[0];
                            if (!latestItem) continue;

                            // Fetch the last 10 messages sent in the channel
                            const messages = await channel.messages.fetch({ limit: 10 });

                            // Check if any of the last 10 messages includes the latest RSS item link
                            const alreadySent = messages.some(message => message.content.includes(latestItem.link));
                            if (alreadySent) continue;

                            await channel.send(latestItem.link);
                        } catch (error) {
                            console.error(`Error fetching RSS feed from ${url}:`, error);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching server data:', error);
            }
        }

        // Fetch RSS feeds every 5 minutes
        setInterval(fetchRSSFeeds, 5 * 60 * 1000);
        // Fetch RSS feeds immediately on startup
        fetchRSSFeeds();
    },
};