const dbMemberData = require('../../models/dbMemberData');
const dbServerData = require('../../models/dbServerData');
const dbUserData = require('../../models/dbUserData');
const { getLanguage, t } = require('../../handlers/languageHandler');
const { EmbedBuilder } = require('discord.js');
const { replaceVariables } = require('../../handlers/variableHandler');
const { parseEmbedScript } = require('../../handlers/embedScriptHandler');
const { generateLevelDetails, calculateExperienceFromLevel } = require('../../handlers/levelHandler');

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (message.author.bot) return;

        const serverId = message.guild.id;
        const memberId = message.author.id;

        try {
            let memberData = await dbMemberData.findOne({ serverId, memberId });
            let serverData = await dbServerData.findOne({ serverId });
            let userData = await dbUserData.findOne({ userId: memberId });

            if (!memberData) {
                memberData = new dbMemberData({ serverId, memberId });
            }

            if (!serverData) {
                serverData = new dbServerData({ serverId });
                await serverData.save();
            }

            if (!userData) {
                userData = new dbUserData({ userId: memberId });
                await userData.save();
            }

            // Check if leveling is enabled
            if (!serverData.levelsEnabled) {
                return;
            }

            // Check if the message is in an ignored channel
            if (serverData.levelsIgnoredChannels.includes(message.channel.id)) {
                return;
            }

            // Check if the message author has an ignored role
            const memberRoles = message.member.roles.cache.map(role => role.id);
            if (memberRoles.some(roleId => serverData.levelsIgnoredRoles.includes(roleId))) {
                return;
            }

            const xpToAdd = 1; // 1 XP per message
            const xpMultiplier = serverData.xpMultiplier || 1;
            const totalXpToAdd = xpToAdd * xpMultiplier;
            memberData.xp = (memberData.xp || 0) + totalXpToAdd;

            // Calculate level based on total XP
            const levelDetails = generateLevelDetails(memberData.xp);
            if (memberData.level < levelDetails.currentLevel) {
                memberData.level = levelDetails.currentLevel;

                if (userData.levelsMessagesEnabled) {
                    const customMessage = serverData.levelsMessage;
                    const data = {
                        guild: message.guild,
                        user: message.author,
                        member: message.member,
                        channel: message.channel,
                        level: memberData.level,
                        xp: memberData.xp
                    };
                    const { embed, messageContent } = parseEmbedScript(customMessage, data);

                    let targetChannel = null;
                    switch (serverData.levelsMessageMode) {
                        case 'context':
                            targetChannel = message.channel;
                            break;
                        case 'channel':
                            targetChannel = message.guild.channels.cache.get(serverData.levelsMessageChannel);
                            break;
                        case 'none':
                            targetChannel = null;
                            break;
                    }

                    if (targetChannel) {
                        if (embed || messageContent) {
                            targetChannel.send({ content: messageContent, embeds: embed ? [embed] : [] });
                        } else {
                            const fallbackMessage = replaceVariables(customMessage, data);
                            targetChannel.send(fallbackMessage);
                        }
                    }
                }

                // Assign roles based on level
                let highestRoleId = null;
                let highestLevel = 0;

                for (const [roleId, level] of serverData.levelRoles.entries()) {
                    if (memberData.level >= level) {
                        if (!highestRoleId || level > highestLevel) {
                            highestRoleId = roleId;
                            highestLevel = level;
                        }
                        if (serverData.levelStackroles) {
                            await message.member.roles.add(roleId);
                        }
                    }
                }

                if (highestRoleId && !serverData.levelStackroles) {
                    await message.member.roles.add(highestRoleId);

                    // Remove all other level roles if stacking is disabled
                    for (const [roleId, level] of serverData.levelRoles.entries()) {
                        if (roleId !== highestRoleId && message.member.roles.cache.has(roleId)) {
                            await message.member.roles.remove(roleId);
                        }
                    }
                }
            }

            await memberData.save();
        } catch (error) {
            console.error(error);
        }
    },
};