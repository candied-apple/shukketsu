const dbRoleData = require('../../models/dbRoleData');
const { getLanguage, t } = require('../../handlers/languageHandler');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'fakepermissions reset',
    description: 'Resets all fake permissions',
    category: 'server',
    syntax: 'fakepermissions reset',
    example: 'fakepermissions reset',
    parameters: [],
    flags: [],
    permissions: ['Administrator'],
    async execute(message, args) {
        try {
            const language = await getLanguage(message.guild.id);
            await dbRoleData.updateMany({}, { $set: { fakePermissions: [] } });

            const embed = new EmbedBuilder()
                .setColor(process.env.SUCCESS_COLOR)
                .setTitle(t('fakePermissionReset_reset', language));

            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            const language = await getLanguage(message.guild.id);
            const embed = new EmbedBuilder()
                .setColor(process.env.ERROR_COLOR)
                .setDescription(t('global_error_description', language));
            message.channel.send({ embeds: [embed] });
        }
    }
};