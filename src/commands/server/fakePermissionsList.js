const dbRoleData = require('../../models/dbRoleData');
const { getLanguage, t } = require('../../handlers/languageHandler');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'fakepermissions list',
    description: 'List all fake permissions',
    category: 'server',
    syntax: 'fakepermissions list [role]',
    example: 'fakepermissions list @Moderator',
    parameters: ['role'],
    flags: [],
    permissions: ['Administrator'],
    async execute(message, args) {
        try {
            const role = message.mentions.roles.first();
            const language = await getLanguage(message.guild.id);

            const roleData = role ? await dbRoleData.findOne({ roleId: role.id }) : await dbRoleData.find();
            if (!roleData || (Array.isArray(roleData) && roleData.length === 0)) {
                const noPermsEmbed = new EmbedBuilder()
                    .setTitle(t('fakePermList_title', language))
                    .setDescription(t('fakePermList_no_fake_perms', language))
                    .setColor(process.env.DEFAULT_COLOR);
                return message.channel.send({ embeds: [noPermsEmbed] });
            }
            const embed = new EmbedBuilder()
                .setTitle(t('fakePermList_title', language))
                .setColor(process.env.DEFAULT_COLOR);

            if (Array.isArray(roleData)) {
                roleData.forEach(data => {
                    embed.addFields({ name: data.roleId, value: data.fakePermissions.join(', ') || t('fakePermList_no_fake_perms', language) });
                });
            } else {
                embed.addFields({ name: role.name, value: roleData.fakePermissions.join(', ') || t('fakePermList_no_fake_perms', language) });
            }
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