const dbServerData = require('../../models/dbServerData');
const { getLanguage, t } = require('../../handlers/languageHandler');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'alias remove',
    description: 'Remove an alias for a command',
    category: 'server',
    syntax: 'alias remove <commandName> <alias>',
    example: 'alias remove ping pong',
    parameters: ['commandName', 'alias'],
    flags: [],
    permissions: ['Administrator'],
    async execute(message, args) {
        const commandName = args.shift();
        const alias = args.join(' ');

        const language = await getLanguage(message.guild.id);

        try {
            const serverData = await dbServerData.findOne({ serverId: message.guild.id });
            const aliases = serverData?.aliases || new Map();
            const commandAliases = aliases.get(commandName) || [];

            const aliasIndex = commandAliases.indexOf(alias);
            if (aliasIndex === -1) {
                const embed = new EmbedBuilder()
                    .setDescription(t('aliasRemove_alias_not_found', language, { alias, commandName }))
                    .setColor(process.env.WARNING_COLOR);
                return message.channel.send({ embeds: [embed] });
            }

            commandAliases.splice(aliasIndex, 1);
            aliases.set(commandName, commandAliases);

            await dbServerData.findOneAndUpdate(
                { serverId: message.guild.id },
                { $set: { aliases } },
                { new: true, upsert: true }
            );

            const embed = new EmbedBuilder()
                .setDescription(t('aliasRemove_alias_removed', language, { alias, commandName }))
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