const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    name: 'messageCreate',
    async execute(message) {

        // Regular expression to match Twitter and X URLs
        const urlRegex = /https:\/\/(twitter|x)\.com\/([a-zA-Z0-9_]+)\/status\/(\d+)/;

        // Check if the message contains a Twitter or X URL
        const match = message.content.match(urlRegex);
        if (match) {
            const screen_name = match[2];
            const id = match[3];
            const baseUrl = 'https://api.fxtwitter.com';
            const endpoint = `/${screen_name}/status/${id}`;

            try {
                // Suppress the embeds in the original message
                await message.suppressEmbeds(true);
                const response = await axios.get(baseUrl + endpoint);
                const tweet = response.data.tweet;

                // Helper function to format numbers
                const formatNumber = (num) => {
                    if (num >= 1e9) {
                        return (num / 1e9).toFixed(1) + 'B';
                    } else if (num >= 1e6) {
                        return (num / 1e6).toFixed(1) + 'M';
                    } else if (num >= 1e3) {
                        return (num / 1e3).toFixed(1) + 'k';
                    }
                    return num.toString();
                };

                // Create the main embed message with the tweet details
                const mainEmbed = new EmbedBuilder()
                    .setDescription(`${tweet.text}\n\n<:heart:1291387306661380128> ${formatNumber(tweet.likes ? tweet.likes : 0)}⠀<:retweet:1291387302609813569> ${formatNumber(tweet.retweets ? tweet.retweets : 0)}⠀<:comment:1291387305097166920> ${formatNumber(tweet.comments ? tweet.comments : 0)}⠀<:eye:1291387308423123006> ${formatNumber(tweet.views)}`)
                    .setURL('https://shukketsu.app')
                    .setColor('#96a7fc')
                    .setTimestamp(new Date(tweet.created_at))
                    .setFooter({ text: 'Twitter' })
                    .setAuthor({ name: `${tweet.author.name} (@${tweet.author.screen_name})`, iconURL: tweet.author.avatar_url, url: tweet.author.url });

                // Create a button to forward the tweet URL
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel('go to tweet')
                            .setStyle(ButtonStyle.Link)
                            .setURL(tweet.url)
                    );

                // Check if there is media in the tweet
                if (tweet.media && tweet.media.all) {
                    // Check if there is a video in the tweet media
                    const video = tweet.media.all.find(media => media.type === 'video');

                    if (video) {
                        // Fetch video metadata to check its size
                        const videoHeadResponse = await axios.head(video.url);
                        const videoSize = parseInt(videoHeadResponse.headers['content-length'], 10);

                        if (videoSize > 25 * 1024 * 1024) { // 25MB in bytes
                            // If video size is greater than 25MB, add a button for the video URL and update the embed description
                            mainEmbed.setDescription(`${tweet.text}\n\nThe video preview is too large. You can view it by clicking the button below.\n\n<:heart:1291387306661380128> ${formatNumber(tweet.likes ? tweet.likes : 0)}⠀<:retweet:1291387302609813569> ${formatNumber(tweet.retweets ? tweet.retweets : 0)}⠀<:comment:1291387305097166920> ${formatNumber(tweet.comments ? tweet.comments : 0)}⠀<:eye:1291387308423123006> ${formatNumber(tweet.views)}`);

                            const videoButton = new ButtonBuilder()
                                .setLabel('preview video')
                                .setStyle(ButtonStyle.Link)
                                .setURL(video.url);

                            row.addComponents(videoButton);

                            await message.channel.send({
                                embeds: [mainEmbed],
                                components: [row],
                                allowedMentions: { parse: [] }
                            });
                        } else {
                            // Download the video into a buffer
                            const videoResponse = await axios.get(video.url, { responseType: 'arraybuffer' });
                            const videoBuffer = Buffer.from(videoResponse.data, 'binary');
                            const attachment = new AttachmentBuilder(videoBuffer, { name: 'video.mp4' });

                            // Send the embed and video to Discord in a single message as a reply
                            await message.channel.send({
                                embeds: [mainEmbed],
                                components: [row],
                                files: [attachment],
                                allowedMentions: { parse: [] }
                            });
                        }
                    } else {
                        // Check if there are images in the tweet media
                        const images = tweet.media.all.filter(media => media.type === 'photo');
                        if (images.length === 1) {
                            // If there is only one image, set it in the main embed
                            mainEmbed.setImage(images[0].url);
                            await message.channel.send({ embeds: [mainEmbed], components: [row], allowedMentions: { parse: [] } });
                        } else if (images.length > 1) {
                            // If there are multiple images, create separate embeds for each
                            const embeds = [mainEmbed];
                            images.forEach(image => {
                                const imageEmbed = new EmbedBuilder()
                                    .setURL('https://shukketsu.app')
                                    .setImage(image.url);
                                embeds.push(imageEmbed);
                            });

                            // Send the embeds and the button to the channel
                            await message.channel.send({ embeds: embeds, components: [row], allowedMentions: { parse: [] } });
                        } else {
                            // If there are no images, just send the main embed
                            await message.channel.send({ embeds: [mainEmbed], components: [row], allowedMentions: { parse: [] } });
                        }
                    }
                } else {
                    // If there is no media, just send the main embed
                    await message.channel.send({ embeds: [mainEmbed], components: [row], allowedMentions: { parse: [] } });
                }
            } catch (error) {
                console.error('Error fetching tweet status:', error);
                await message.channel.send({ content: 'Error fetching tweet details.', allowedMentions: { parse: [] } });
            }
        }
    },
};