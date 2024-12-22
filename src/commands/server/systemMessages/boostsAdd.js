const { EmbedBuilder } = require('discord.js');
const dbServerData = require('../../../models/dbServerData');
const { getLanguage, t } = require('../../../handlers/languageHandler');

module.exports = {
    name: 'boosts add',
    description: 'Add a boosts message for a channel',
    category: 'server',
    syntax: 'boosts add <channel> <message> [--self_destruct <6-60>]',
    example: 'boosts add #general Thank you for boosting, {{user}}! --self_destruct 10',
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
                const embed = new EmbedBuilder()
                    .setColor(process.env.ERROR_COLOR)
                    .setDescription(t('boostAdd_invalid_self_destruct', language));
                return message.channel.send({ embeds: [embed] });
            }
            args.splice(selfDestructIndex, 2);
        }

        const boostMessage = args.slice(1).join(' ');

        if (!channel || !boostMessage) {
            const embed = new EmbedBuilder()
                .setColor(process.env.ERROR_COLOR)
                .setDescription(t('boostAdd_provide_channel_and_message', language));
            return message.channel.send({ embeds: [embed] });
        }

        try {
            const serverData = await dbServerData.findOne({ serverId: message.guild.id });
            const boostMessages = serverData.boostMessages;
        
            // Filter messages for the specific channel
            const channelMessages = boostMessages.filter(msg => msg.channelId === channel.id);
        
            // Check if the limit of 3 messages per channel is reached
            if (channelMessages.length >= 3) {
                const embed = new EmbedBuilder()
                    .setColor(process.env.ERROR_COLOR)
                    .setDescription(t('boostAdd_boost_message_limit_reached', language));
                return message.channel.send({ embeds: [embed] });
            }
        
            boostMessages.push({
                channelId: channel.id,
                message: boostMessage,
                selfDestruct: selfDestruct
            });
        
            await dbServerData.findOneAndUpdate(
                { serverId: message.guild.id },
                { boostMessages },
                { new: true, upsert: true }
            );
        
            const embed = new EmbedBuilder()
                .setDescription(t('boostAdd_boost_message_added', language, { channel: channel.name }))
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