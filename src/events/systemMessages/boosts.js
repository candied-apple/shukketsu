const { EmbedBuilder } = require('discord.js');
const dbServerData = require('../../models/dbServerData');
const { replaceVariables } = require('../../handlers/variableHandler');

module.exports = {
    name: 'guildMemberUpdate',
    async execute(oldMember, newMember) {
        // Check if the member started boosting
        if (!oldMember.premiumSince && newMember.premiumSince) {
            try {
                const serverData = await dbServerData.findOne({ serverId: newMember.guild.id });
                const boostMessages = serverData.boostMessages;

                boostMessages.forEach(async (msg) => {
                    const channel = newMember.guild.channels.cache.get(msg.channelId);
                    if (channel) {
                        const data = {
                            guild: newMember.guild,
                            user: newMember.user,
                            member: newMember,
                            channel: channel
                        };

                        const boostMessage = replaceVariables(msg.message, data);

                        const sentMessage = await channel.send(boostMessage);

                        if (msg.selfDestruct > 0) {
                            setTimeout(() => {
                                sentMessage.delete().catch(console.error);
                            }, msg.selfDestruct * 1000);
                        }
                    }
                });
            } catch (error) {
                console.error(error);
            }
        }
    },
};