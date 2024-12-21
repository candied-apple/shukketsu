const { EmbedBuilder } = require('discord.js');
const dbMemberData = require('../../models/dbMemberData');
const { getLanguage, t } = require('../../handlers/languageHandler');
const { generateLevelDetails } = require('../../handlers/levelHandler');

module.exports = {
    name: 'removexp',
    description: 'Remove experience from a user',
    category: 'levels',
    syntax: 'removexp <user> <amount>',
    example: 'removexp @username 1000',
    parameters: ['user', 'amount'],
    permissions: ['ManageGuild'],
    async execute(message, args) {
        const target = message.mentions.members.first();
        const amount = parseInt(args[1]);

        if (!target || isNaN(amount)) {
            const language = await getLanguage(message.guild.id);
            const embed = new EmbedBuilder()
                .setColor(process.env.WARNING_COLOR)
                .setDescription(t('removexp_invalid_arguments', language));
            return message.channel.send({ embeds: [embed] });
        }

        try {
            const serverId = message.guild.id;
            const memberId = target.id;
            let memberData = await dbMemberData.findOne({ serverId, memberId });

            if (!memberData) {
                memberData = new dbMemberData({ serverId, memberId });
            }

            memberData.xp = Math.max(0, memberData.xp - amount);
            const levelDetails = generateLevelDetails(memberData.xp);
            memberData.level = levelDetails.currentLevel;
            await memberData.save();

            const language = await getLanguage(message.guild.id);
            const embed = new EmbedBuilder()
                .setColor(process.env.SUCCESS_COLOR)
                .setDescription(t('removexp_success', language, { user: target.user.username, xp: amount, level: memberData.level }));

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