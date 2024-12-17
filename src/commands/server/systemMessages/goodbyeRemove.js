const { EmbedBuilder } = require('discord.js');
const dbServerData = require('../../../models/dbServerData');
const { getLanguage, t } = require('../../../handlers/languageHandler');

module.exports = {
    name: 'goodbye remove',
    description: 'Remove a goodbye message from a channel',
    category: 'server',
    syntax: 'goodbye remove <channel> <messagenumber>',
    example: 'goodbye remove #general 1',
    parameters: ['channel', 'messagenumber'],
    flags: [],
    permissions: ['ManageGuild'],
    async execute(message, args) {
        const language = await getLanguage(message.guild.id);
        const channel = message.mentions.channels.first();
        const messageNumber = parseInt(args[1], 10);

        if (!channel || isNaN(messageNumber)) {
            return message.channel.send(t('goodbyeRemove_provide_channel_and_message_number', language));
        }

        try {
            const serverData = await dbServerData.findOne({ serverId: message.guild.id });
            const goodbyeMessages = serverData.goodbyeMessages.filter(msg => msg.channelId === channel.id);

            if (goodbyeMessages.length === 0) {
                return message.channel.send(t('goodbyeRemove_no_goodbye_message', language, { channel: channel.name }));
            }

            if (messageNumber < 1 || messageNumber > goodbyeMessages.length) {
                return message.channel.send(t('goodbyeRemove_invalid_message_number', language, { totalMessages: goodbyeMessages.length }));
            }

            goodbyeMessages.splice(messageNumber - 1, 1);

            await dbServerData.findOneAndUpdate(
                { serverId: message.guild.id },
                { goodbyeMessages },
                { new: true, upsert: true }
            );

            const embed = new EmbedBuilder()
                .setDescription(t('goodbyeRemove_goodbye_message_removed', language, { channel: channel.name }))
                .setColor(process.env.SUCCESS_COLOR);

            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            const embed = new EmbedBuilder()
                .setColor(process.env.ERROR_COLOR)
                .setDescription(t('global_error_description', language));
            message.channel.send({ embeds: [embed] });
        }
    },
};