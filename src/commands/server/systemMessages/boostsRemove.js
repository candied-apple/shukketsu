const { EmbedBuilder } = require('discord.js');
const dbServerData = require('../../../models/dbServerData');
const { getLanguage, t } = require('../../../handlers/languageHandler');

module.exports = {
    name: 'boosts remove',
    description: 'Remove a boosts message from a channel',
    category: 'server',
    syntax: 'boosts remove <channel> <messagenumber>',
    example: 'boosts remove #general 1',
    parameters: ['channel', 'messagenumber'],
    flags: [],
    permissions: ['ManageGuild'],
    async execute(message, args) {
        const language = await getLanguage(message.guild.id);
        const channel = message.mentions.channels.first();
        const messageNumber = parseInt(args[1], 10);

        if (!channel || isNaN(messageNumber)) {
            return message.channel.send(t('boostRemove_provide_channel_and_message_number', language));
        }

        try {
            const serverData = await dbServerData.findOne({ serverId: message.guild.id });
            const boostMessages = serverData.boostMessages.filter(msg => msg.channelId === channel.id);

            if (boostMessages.length === 0) {
                return message.channel.send(t('boostRemove_no_boost_message', language, { channel: channel.name }));
            }

            if (messageNumber < 1 || messageNumber > boostMessages.length) {
                return message.channel.send(t('boostRemove_invalid_message_number', language, { totalMessages: boostMessages.length }));
            }

            boostMessages.splice(messageNumber - 1, 1);

            await dbServerData.findOneAndUpdate(
                { serverId: message.guild.id },
                { boostMessages },
                { new: true, upsert: true }
            );

            const embed = new EmbedBuilder()
                .setDescription(t('boostRemove_boost_message_removed', language, { channel: channel.name }))
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