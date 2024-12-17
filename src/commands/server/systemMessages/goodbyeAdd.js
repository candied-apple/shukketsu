const { EmbedBuilder } = require('discord.js');
const dbServerData = require('../../../models/dbServerData');
const { getLanguage, t } = require('../../../handlers/languageHandler');

module.exports = {
    name: 'goodbye add',
    description: 'Add a goodbye message for a channel',
    category: 'server',
    syntax: 'goodbye add <channel> <message> [--self_destruct <6-60>]',
    example: 'goodbye add #general Goodbye, {{user}}! --self_destruct 10',
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
                return message.channel.send(t('goodbyeAdd_invalid_self_destruct', language));
            }
            args.splice(selfDestructIndex, 2);
        }

        const goodbyeMessage = args.slice(1).join(' ');

        if (!channel || !goodbyeMessage) {
            return message.channel.send(t('goodbyeAdd_provide_channel_and_message', language));
        }

        try {
            const serverData = await dbServerData.findOne({ serverId: message.guild.id });
            const goodbyeMessages = serverData.goodbyeMessages;
        
            // Filter messages for the specific channel
            const channelMessages = goodbyeMessages.filter(msg => msg.channelId === channel.id);
        
            // Check if the limit of 3 messages per channel is reached
            if (channelMessages.length >= 3) {
                return message.channel.send(t('goodbyeAdd_goodbye_message_limit_reached', language));
            }
        
            goodbyeMessages.push({
                channelId: channel.id,
                message: goodbyeMessage,
                selfDestruct: selfDestruct
            });
        
            await dbServerData.findOneAndUpdate(
                { serverId: message.guild.id },
                { goodbyeMessages },
                { new: true, upsert: true }
            );
        
            const embed = new EmbedBuilder()
                .setDescription(t('goodbyeAdd_goodbye_message_added', language, { channel: channel.name }))
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