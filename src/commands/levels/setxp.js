const { EmbedBuilder } = require('discord.js');
const dbMemberData = require('../../models/dbMemberData');
const { getLanguage, t } = require('../../handlers/languageHandler');
const { generateLevelDetails } = require('../../handlers/levelHandler');

module.exports = {
    name: 'setxp',
    description: 'Set a user\'s experience',
    category: 'levels',
    syntax: 'setxp <user> <amount>',
    example: 'setxp @username 1000',
    parameters: ['user', 'amount'],
    permissions: ['ManageGuild'],
    async execute(message, args) {
        const target = message.mentions.members.first();
        const amount = parseInt(args[1]);

        if (!target || isNaN(amount)) {
            const language = await getLanguage(message.guild.id);
            const embed = new EmbedBuilder()
                .setColor(process.env.ERROR_COLOR)
                .setDescription(t('global_error_description', language));
            return message.channel.send({ embeds: [embed] });
        }

        try {
            const serverId = message.guild.id;
            const memberId = target.id;
            let memberData = await dbMemberData.findOne({ serverId, memberId });

            if (!memberData) {
                memberData = new dbMemberData({ serverId, memberId });
            }

            memberData.xp = amount;
            const levelDetails = generateLevelDetails(memberData.xp);
            memberData.level = levelDetails.currentLevel;
            await memberData.save();

            const language = await getLanguage(message.guild.id);
            const embed = new EmbedBuilder()
                .setColor(process.env.SUCCESS_COLOR)
                .setDescription(t('setxp_success', language, { user: target.user.username, xp: amount, level: memberData.level }));

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