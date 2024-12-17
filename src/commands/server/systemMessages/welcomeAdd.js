const { EmbedBuilder } = require('discord.js');
const dbServerData = require('../../../models/dbServerData');
const { getLanguage, t } = require('../../../handlers/languageHandler');

module.exports = {
    name: 'welcome add',
    description: 'Add a welcome message for a channel',
    category: 'server',
    syntax: 'welcome add <channel> <message> [--self_destruct <6-60>]',
    example: 'welcome add #general Welcome to the server, {{user}}! --self_destruct 10',
    parameters: ['channel', 'message'],
    flags: ['--self_destruct'],
    permissions: ['ManageGuild'],
    async execute(message, args) {
        const language = await getLanguage(message.guild.id);
        const channel = message.mentions.channels.first();
        const selfDestructIndex = args.indexOf('--self_destruct');
        let selfDestruct = 0;

        if (selfDestructIndex !== -1) {
            selfDestruct = parseInt(args[selfDestructIndex + 1], 10);
            if (isNaN(selfDestruct) || selfDestruct < 6 || selfDestruct > 60) {
                return message.channel.send(t('welcomeAdd_invalid_self_destruct', language));
            }
            args.splice(selfDestructIndex, 2);
        }

        const welcomeMessage = args.slice(1).join(' ');

        if (!channel || !welcomeMessage) {
            return message.channel.send(t('welcomeAdd_provide_channel_and_message', language));
        }

        try {
            const serverData = await dbServerData.findOne({ serverId: message.guild.id });
            const welcomeMessages = serverData.welcomeMessages;
        
            // Filter messages for the specific channel
            const channelMessages = welcomeMessages.filter(msg => msg.channelId === channel.id);
        
            // Check if the limit of 3 messages per channel is reached
            if (channelMessages.length >= 3) {
                return message.channel.send(t('welcomeAdd_welcome_message_limit_reached', language));
            }
        
            welcomeMessages.push({
                channelId: channel.id,
                message: welcomeMessage,
                selfDestruct: selfDestruct
            });
        
            await dbServerData.findOneAndUpdate(
                { serverId: message.guild.id },
                { welcomeMessages },
                { new: true, upsert: true }
            );
        
            const embed = new EmbedBuilder()
                .setDescription(t('welcomeAdd_welcome_message_added', language, { channel: channel.name }))
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