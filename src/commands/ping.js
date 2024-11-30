require('dotenv').config();
const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    name: 'ping',
    description: 'Replies with Pong along with the latency!',
    permission: 'Administrator',
    async execute(message, args) {
        const latency = Date.now() - message.createdTimestamp;

        const restPingStart = Date.now();
        await axios.get('https://discord.com/api/v10/gateway');
        const restPing = Date.now() - restPingStart;

        const embed = new EmbedBuilder()
            .setTitle('🏓 Pong!')
            .setDescription(`Latency is ${latency}ms.\nREST Ping is ${restPing}ms.`)
            .setColor(process.env.THEME);

        message.channel.send({ 
            embeds: [embed]
        });
    },
};