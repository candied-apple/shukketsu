const { EmbedBuilder } = require('discord.js');
const dbMemberData = require('../../models/dbMemberData');
const { getLanguage, t } = require('../../handlers/languageHandler');
const { calculateExperienceFromLevel, generateLevelDetails } = require('../../handlers/levelHandler');

module.exports = {
    name: 'setlevel',
    description: 'Set a user\'s level',
    category: 'levels',
    syntax: 'setlevel <user> <level>',
    example: 'setlevel @username 10',
    parameters: ['user', 'level'],
    permissions: ['ManageGuild'],
    async execute(message, args) {
        const target = message.mentions.members.first();
        const level = parseInt(args[1]);

        if (!target || isNaN(level)) {
            const language = await getLanguage(message.guild.id);
            const embed = new EmbedBuilder()
                .setColor(process.env.WARNING_COLOR)
                .setDescription(t('setlevel_invalid_arguments', language));
            return message.channel.send({ embeds: [embed] });
        }

        try {
            const serverId = message.guild.id;
            const memberId = target.id;
            let memberData = await dbMemberData.findOne({ serverId, memberId });

            if (!memberData) {
                memberData = new dbMemberData({ serverId, memberId });
            }

            memberData.level = level;
            memberData.xp = calculateExperienceFromLevel(level);
            await memberData.save();

            const language = await getLanguage(message.guild.id);
            const embed = new EmbedBuilder()
                .setColor(process.env.SUCCESS_COLOR)
                .setDescription(t('setlevel_success', language, { user: target.user.username, level }));

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