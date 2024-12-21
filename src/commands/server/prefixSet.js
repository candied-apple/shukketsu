const { EmbedBuilder } = require('discord.js');
const dbServerData = require('../../models/dbServerData');
const { getLanguage, t } = require('../../handlers/languageHandler');

module.exports = {
    name: 'prefix set',
    description: 'Set command prefix for the server.',
    category: 'server',
    syntax: 'prefix set <new_prefix>',
    example: 'prefix set !',
    parameters: ['new_prefix'],
    paramOptional: false,
    flags: [],
    permissions: ['Administrator'],
    async execute(message, args) {
        if (args.length < 1) {
            const language = await getLanguage(message.guild.id);
            const embed = new EmbedBuilder()
                .setColor(process.env.ERROR_COLOR)
                .setDescription(t('global_error_description', language));
            return message.channel.send({ embeds: [embed] });
        }

        const newPrefix = args[0];

        try {
            const serverData = await dbServerData.findOneAndUpdate(
                { serverId: message.guild.id },
                { prefix: newPrefix },
                { new: true, upsert: true }
            );

            const language = await getLanguage(message.guild.id);
            const embed = new EmbedBuilder()
                .setColor(process.env.SUCCESS_COLOR)
                .setDescription(t('prefix_set_success', language, { prefix: newPrefix }));
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