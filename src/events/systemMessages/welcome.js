const { EmbedBuilder } = require('discord.js');
const dbServerData = require('../../models/dbServerData');
const { replaceVariables } = require('../../handlers/variableHandler');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        try {
            const serverData = await dbServerData.findOne({ serverId: member.guild.id });
            const welcomeMessages = serverData.welcomeMessages;

            welcomeMessages.forEach(async (msg) => {
                const channel = member.guild.channels.cache.get(msg.channelId);
                if (channel) {
                    const data = {
                        guild: member.guild,
                        user: member.user,
                        member: member,
                        channel: channel
                    };

                    const welcomeMessage = replaceVariables(msg.message, data);

                    const sentMessage = await channel.send(welcomeMessage);

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
    },
};