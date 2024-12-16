const dbServerData = require('../../models/dbServerData');
const { getLanguage, t } = require('../../handlers/languageHandler');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'alias add',
    description: 'Add an alias for a command',
    syntax: 'alias add <commandName> <alias>',
    example: 'alias add ping pong pong',
    permissions: ['Administrator'],
    parameters: ['commandName', 'alias'],
    async execute(message, args) {
        const commandName = args.shift();
        const alias = args.join(' ');

        const language = await getLanguage(message.guild.id);

        if (alias.length > 20) {
            const embed = new EmbedBuilder()
                .setDescription(t('aliasAdd_alias_too_long', language, { maxLength: 20 }))
                .setColor(process.env.WARNING_COLOR);
            return message.channel.send({ embeds: [embed] });
        }

        // Check if the command exists
        if (!message.client.commands.has(commandName)) {
            const embed = new EmbedBuilder()
                .setDescription(t('aliasAdd_command_not_found', language, { commandName }))
                .setColor(process.env.ERROR_COLOR);
            return message.channel.send({ embeds: [embed] });
        }

        try {
            const serverData = await dbServerData.findOne({ serverId: message.guild.id });
            const aliases = serverData?.aliases || new Map();
            const commandAliases = aliases.get(commandName) || [];

            if (commandAliases.length >= 2) {
                const embed = new EmbedBuilder()
                    .setDescription(t('aliasAdd_too_many_aliases', language, { maxAliases: 2 }))
                    .setColor(process.env.WARNING_COLOR);
                return message.channel.send({ embeds: [embed] });
            }

            commandAliases.push(alias);
            aliases.set(commandName, commandAliases);

            await dbServerData.findOneAndUpdate(
                { serverId: message.guild.id },
                { $set: { aliases } },
                { new: true, upsert: true }
            );

            const embed = new EmbedBuilder()
                .setDescription(t('aliasAdd_alias_added', language, { alias, commandName }))
                .setColor(process.env.SUCCESS_COLOR);
            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            const embed = new EmbedBuilder()
                .setDescription(t('global_error_description', language))
                .setColor(process.env.ERROR_COLOR);
            message.channel.send({ embeds: [embed] });
        }
    }
};