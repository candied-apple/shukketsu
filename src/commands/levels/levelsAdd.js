const { EmbedBuilder } = require('discord.js');
const { getLanguage, t } = require('../../handlers/languageHandler');
const dbServerData = require('../../models/dbServerData');

module.exports = {
    name: 'levels add',
    description: 'Create level role',
    category: 'levels',
    syntax: 'levels add <role> <rank>',
    example: 'levels add @Role 10',
    parameters: ['role', 'rank'],
    paramOptional: false,
    flags: [],
    permissions: ['ManageGuild'],
    async execute(message, args) {
        try {
            const language = await getLanguage(message.guild.id);
            const role = message.mentions.roles.first();
            const rank = parseInt(args[1]);

            const serverData = await dbServerData.findOne({ serverId: message.guild.id });
            serverData.levelRoles.set(role.id, rank);
            await serverData.save();

            const embed = new EmbedBuilder()
                .setDescription(t('levelsAdd_success', language, { role: role.name, rank }))
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