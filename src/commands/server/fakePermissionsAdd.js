const dbRoleData = require('../../models/dbRoleData');
const { getLanguage, t } = require('../../handlers/languageHandler');
const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'fakepermissions add',
    description: 'Grant a fake permission to a role',
    category: 'server',
    syntax: 'fakepermissions add <role> <permission>',
    example: 'fakepermissions add @Moderator ban_members',
    parameters: ['role', 'permission'],
    flags: [],
    permissions: ['Administrator'],
    async execute(message, args) {
        try {
            const role = message.mentions.roles.first();
            const permission = args[1];
            const language = await getLanguage(message.guild.id);

            if (!PermissionsBitField.Flags[permission]) {
                const embed = new EmbedBuilder()
                    .setColor(process.env.WARNING_COLOR)
                    .setDescription(t('fakePermsAdd_invalid_permission', language));
                return message.channel.send({ embeds: [embed] });
            }

            const roleData = await dbRoleData.findOne({ roleId: role.id });
            if (roleData && roleData.fakePermissions.includes(permission)) {
                const embed = new EmbedBuilder()
                    .setColor(process.env.WARNING_COLOR)
                    .setDescription(t('fakePermsAdd_already_exists', language, { role: role.name, permission }));
                return message.channel.send({ embeds: [embed] });
            }

            await dbRoleData.findOneAndUpdate(
                { roleId: role.id },
                { $addToSet: { fakePermissions: permission } },
                { new: true, upsert: true }
            );
            const embed = new EmbedBuilder()
                .setColor(process.env.SUCCESS_COLOR)
                .setDescription(t('fakePermsAdd_permission_added', language, { role: role.name, permission }));
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