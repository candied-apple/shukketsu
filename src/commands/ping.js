const { EmbedBuilder, PartialGroupDMChannel } = require('discord.js');
const axios = require('axios');
const { getLanguage, t } = require('../handlers/languageHandler');

module.exports = {
    name: 'ping',
    description: 'Replies with Pong along with the REST ping!',
    syntax:"ping",
    example:"ping",
    parameters:[],
    permissions:["Administrator"],
    async execute(message, args) {
        const restPingStart = Date.now();
        await axios.get('https://discord.com/api/v10/gateway');
        const restPing = Date.now() - restPingStart;

        const language = await getLanguage(message.guild.id);
        const embed = new EmbedBuilder()
            .setDescription(t('ping_description', language, { ping: restPing }))
            .setColor(process.env.DEFAULT_COLOR);

        message.channel.send({ 
            embeds: [embed]
        });
    },
};