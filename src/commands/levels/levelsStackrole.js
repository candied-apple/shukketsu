const { EmbedBuilder } = require('discord.js');
const { getLanguage, t } = require('../../handlers/languageHandler');
const dbServerData = require('../../models/dbServerData');

module.exports = {
    name: 'levels stackrole',
    description: 'Enable or disable stacking of roles',
    category: 'levels',
    syntax: 'levels stackrole <on|off>',
    example: 'levels stackrole on',
    parameters: ['option'],
    paramOptional: false,
    flags: [],
    permissions: ['ManageGuild'],
    async execute(message, args) {
        try {
            const language = await getLanguage(message.guild.id);
            const option = args[0]?.toLowerCase();

            if (!['on', 'off'].includes(option)) {
                return message.channel.send(t('levelsStackRoles_invalid_args', language));
            }

            const serverData = await dbServerData.findOne({ serverId: message.guild.id });
            serverData.levelStackroles = option === 'on';
            await serverData.save();

            const embed = new EmbedBuilder()
                .setDescription(t('levelsStackRoles_success', language, { option }))
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