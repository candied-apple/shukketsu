const { EmbedBuilder } = require('discord.js');
const dbMemberData = require('../../models/dbMemberData');
const { getLanguage, t } = require('../../handlers/languageHandler');

module.exports = {
    name: 'levels cleanup',
    description: 'Reset level & XP for members no longer in the server',
    category: 'admin',
    syntax: 'levels cleanup',
    example: 'levels cleanup',
    parameters: [],
    paramOptional: true,
    flags: [],
    permissions: ['Administrator'],
    async execute(message) {
        try {
            const language = await getLanguage(message.guild.id);
            const guildMembers = await message.guild.members.fetch();
            const dbMembers = await dbMemberData.find({ serverId: message.guild.id });

            for (const member of dbMembers) {
                if (!guildMembers.has(member.userId)) {
                    member.xp = 0;
                    member.level = 1;
                    await member.save();
                }
            }

            const embed = new EmbedBuilder()
                .setDescription(t('levelsCleanup_success', language))
                .setColor(process.env.SUCCESS_COLOR);

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