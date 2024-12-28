const { EmbedBuilder } = require('discord.js');
const dbServerData = require('../../models/dbServerData');
const { getLanguage, t } = require('../../handlers/languageHandler');

module.exports = {
    name: 'autorole remove',
    description: 'Removes an autorole and stops assigning it on join.',
    category: 'server',
    syntax: 'autorole remove <role>',
    example: 'autorole remove @Member',
    parameters: ['role'],
    paramOptional: false,
    flags: [],
    permissions: ['ManageGuild'],
    async execute(message, args) {
        try {
            if (!args[0]) {
                return message.channel.send('Please specify a role to remove from autoroles.');
            }

            const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
            if (!role) {
                return message.channel.send('Role not found. Please mention a valid role or provide a valid role ID.');
            }

            const serverData = await dbServerData.findOne({ serverId: message.guild.id });
            if (!serverData) {
                return message.channel.send('Server data not found.');
            }

            if (!serverData.autoroles || !serverData.autoroles.includes(role.id)) {
                return message.channel.send('This role is not an autorole.');
            }

            serverData.autoroles = serverData.autoroles.filter(roleId => roleId !== role.id);
            await serverData.save();

            const language = await getLanguage(message.guild.id);
            const embed = new EmbedBuilder()
                .setColor(process.env.SUCCESS_COLOR)
                .setDescription(t('autorole_remove_success', language, { role: role.name }));

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