const { EmbedBuilder } = require('discord.js');
const dbServerData = require('../../models/dbServerData');
const { getLanguage, t } = require('../../handlers/languageHandler');

module.exports = {
    name: 'autorole add',
    description: 'Adds an autorole and assigns it to members on join.',
    category: 'server',
    syntax: 'autorole add <role>',
    example: 'autorole add @Member',
    parameters: ['role'],
    paramOptional: false,
    flags: [],
    permissions: ['ManageGuild'],
    async execute(message, args) {
        try {
            if (!args[0]) {
                return message.reply('Please specify a role to add as autorole.');
            }

            const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
            if (!role) {
                return message.reply('Role not found. Please mention a valid role or provide a valid role ID.');
            }

            const serverData = await dbServerData.findOne({ serverId: message.guild.id });
            if (!serverData) {
                return message.reply('Server data not found.');
            }

            if (!serverData.autoroles) {
                serverData.autoroles = [];
            }

            if (serverData.autoroles.includes(role.id)) {
                return message.reply('This role is already an autorole.');
            }

            serverData.autoroles.push(role.id);
            await serverData.save();

            const language = await getLanguage(message.guild.id);
            const embed = new EmbedBuilder()
                .setColor(process.env.SUCCESS_COLOR)
                .setDescription(t('autorole_add_success', language, { role: role.name }));

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