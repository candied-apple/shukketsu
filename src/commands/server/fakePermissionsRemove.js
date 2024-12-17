const dbRoleData = require('../../models/dbRoleData');
const { getLanguage, t } = require('../../handlers/languageHandler');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'fakepermissions remove',
    description: 'Remove a fake permission from a role',
    category: 'server',
    syntax: 'fakepermissions remove <role> <permission>',
    example: 'fakepermissions remove @Moderator ban_members',
    parameters: ['role', 'permission'],
    flags: [],
    permissions: ['Administrator'],
    async execute(message, args) {
        try {
            const role = message.mentions.roles.first();
            const permission = args[1];
            const language = await getLanguage(message.guild.id);

            await dbRoleData.findOneAndUpdate(
                { roleId: role.id },
                { $pull: { fakePermissions: permission } },
                { new: true }
            );

            const embed = new EmbedBuilder()
                .setColor(process.env.SUCCESS_COLOR)
                .setTitle(t('fakePermRemove_permission_removed', language))
                .addFields(
                    { name: 'Role', value: role.name, inline: true },
                    { name: 'Permission', value: permission, inline: true }
                );

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