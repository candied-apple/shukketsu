require('dotenv').config();
const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

async function setVoiceStatus(channelId, status) {
    try {
        const response = await axios.put(`https://discord.com/api/v9/channels/${channelId}/voice-status`, 
            { status: status }, 
            {
                headers: {
                    'accept': '*/*',
                    'authorization': `Bot ${process.env.TOKEN}`,
                    'content-type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        throw new Error(error.response ? error.response.data : error.message);
    }
}

module.exports = {
    name: 'test',
    description: 'Sets the voice status of a channel',
    permission: 'Administrator',
    async execute(message, args) {
        if (args.length < 2) {
            return message.reply('Please provide a channel ID and a status.');
        }

        const channelId = args[0];
        const status = args[1];

        try {
            const response = await setVoiceStatus(channelId, status);
            const embed = new EmbedBuilder()
                .setTitle('Voice Status Updated')
                .setDescription(`Channel ID: ${channelId}\nStatus: ${status}\nResponse: ${response}`)
                .setColor(process.env.THEME);

            message.channel.send({ 
                embeds: [embed]
            });
        } catch (error) {
            message.reply(`Failed to update voice status: ${error.message}`);
        }
    },
};