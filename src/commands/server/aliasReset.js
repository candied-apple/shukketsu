const dbServerData = require('../../models/dbServerData');
const { getLanguage, t } = require('../../handlers/languageHandler');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'alias reset',
    description: 'Reset every alias for all commands',
    category: 'server',
    syntax: 'alias reset',
    example: 'alias reset',
    parameters: [],
    flags: [],
    permissions: ['Manage Guild'],
    async execute(message) {
        const language = await getLanguage(message.guild.id);

        try {
            await dbServerData.findOneAndUpdate(
                { serverId: message.guild.id },
                { $unset: { aliases: '' } },
                { new: true, upsert: true }
            );

            const embed = new EmbedBuilder()
                .setDescription(t('aliasReset_success', language))
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