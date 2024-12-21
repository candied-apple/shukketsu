const { EmbedBuilder } = require('discord.js');
const dbMemberData = require('../../models/dbMemberData');
const dbServerData = require('../../models/dbServerData'); // Import dbServerData
const { getLanguage, t } = require('../../handlers/languageHandler');
const { generateLevelDetails } = require('../../handlers/levelHandler'); // Import generateLevelDetails from levelHandler

module.exports = {
    name: 'levels',
    description: 'View your level and experience',
    category: 'levels',
    syntax: 'levels [member]',
    example: 'levels @username',
    parameters: ['member'],
    paramOptional: true,
    permissions: [],
    async execute(message, args) {
        const target = message.mentions.members.first() || message.member;
        const serverId = message.guild.id;
        const memberId = target.id;

        try {
            const serverData = await dbServerData.findOne({ serverId });
            if (!serverData.levelsEnabled) {
                const language = await getLanguage(message.guild.id);
                const embed = new EmbedBuilder()
                    .setColor(process.env.WARNING_COLOR)
                    .setDescription(t('levels_disabled', language));
                return message.channel.send({ embeds: [embed] });
            }

            const language = await getLanguage(message.guild.id);
            const memberData = await dbMemberData.findOne({ serverId, memberId });

            if (!memberData) {
                const embed = new EmbedBuilder()
                    .setColor(process.env.WARNING_COLOR)
                    .setDescription(t('levels_no_data', language, { username: target.user.username }));
                return message.channel.send({ embeds: [embed] });
            }

            const allMembers = await dbMemberData.find({ serverId }).sort({ xp: -1, level: -1 }).exec();
            const rank = allMembers.findIndex(member => member.memberId === memberId) + 1;

            const { currentExpProgress, requiredexperience, levelBar } = generateLevelDetails(memberData.xp); // Use generateLevelDetails to get levelBar
            const progressPercentage = ((currentExpProgress / (currentExpProgress + requiredexperience)) * 100).toFixed(2);
            const embed = new EmbedBuilder()
                .setColor(process.env.DEFAULT_COLOR)
                .setTitle(t('levels_title', language, { username: target.user.username }))
                .addFields(
                    { name: t('levels_level', language), value: memberData.level.toString(), inline: true },
                    { name: t('levels_rank', language), value: `#${rank}`, inline: true },
                    { name: t('levels_xp', language), value: `${currentExpProgress}/${currentExpProgress + requiredexperience} XP`, inline: true },
                    { name: t('levels_progress', language, { percentage: progressPercentage }), value: levelBar, inline: false }
                )
                .setFooter({ text: t('levels_footer', language, { totalXP: memberData.xp }) });

            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            const language = await getLanguage(message.guild.id);
            const embed = new EmbedBuilder()
                .setColor(process.env.ERROR_COLOR)
                .setDescription(t('global_error_description', language));
            message.channel.send({ embeds: [embed] });
        }
    },
};