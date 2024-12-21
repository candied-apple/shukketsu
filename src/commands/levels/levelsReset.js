const { EmbedBuilder } = require('discord.js');
const dbMemberData = require('../../models/dbMemberData');
const { getLanguage, t } = require('../../handlers/languageHandler');

module.exports = {
    name: 'levels reset',
    description: 'Reset all members level and XP.',
    category: 'server',
    syntax: 'levels reset',
    example: 'levels reset',
    parameters: [],
    paramOptional: true,
    flags: [],
    permissions: ['ManageGuild'],
    async execute(message, args) {
        try {
            const language = await getLanguage(message.guild.id);

            await dbMemberData.updateMany(
                { serverId: message.guild.id },
                { $set: { xp: 0, level: 1 } }
            );

            const embed = new EmbedBuilder()
                .setDescription(t('levelsReset_success', language))
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