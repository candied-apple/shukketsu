const { EmbedBuilder } = require('discord.js');
const dbServerData = require('../../../models/dbServerData');
const { getLanguage, t } = require('../../../handlers/languageHandler');

module.exports = {
    name: 'welcome remove',
    description: 'Remove a welcome message from a channel',
    category: 'server',
    syntax: 'welcome remove <channel> <messagenumber>',
    example: 'welcome remove #general 1',
    parameters: ['channel', 'messagenumber'],
    flags: [],
    permissions: ['ManageGuild'],
    async execute(message, args) {
        const language = await getLanguage(message.guild.id);
        const channel = message.mentions.channels.first();
        const messageNumber = parseInt(args[1], 10);

        if (!channel || isNaN(messageNumber)) {
            const embed = new EmbedBuilder()
                .setColor(process.env.ERROR_COLOR)
                .setDescription(t('welcomeRemove_provide_channel_and_message_number', language));
            return message.channel.send({ embeds: [embed] });
        }

        try {
            const serverData = await dbServerData.findOne({ serverId: message.guild.id });
            const welcomeMessages = serverData.welcomeMessages.filter(msg => msg.channelId === channel.id);

            if (welcomeMessages.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor(process.env.ERROR_COLOR)
                    .setDescription(t('welcomeRemove_no_welcome_message', language, { channel: channel.name }));
                return message.channel.send({ embeds: [embed] });
            }

            if (messageNumber < 1 || messageNumber > welcomeMessages.length) {
                const embed = new EmbedBuilder()
                    .setColor(process.env.ERROR_COLOR)
                    .setDescription(t('welcomeRemove_invalid_message_number', language, { totalMessages: welcomeMessages.length }));
                return message.channel.send({ embeds: [embed] });
            }

            welcomeMessages.splice(messageNumber - 1, 1);

            await dbServerData.findOneAndUpdate(
                { serverId: message.guild.id },
                { welcomeMessages },
                { new: true, upsert: true }
            );

            const embed = new EmbedBuilder()
                .setDescription(t('welcomeRemove_welcome_message_removed', language, { channel: channel.name }))
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