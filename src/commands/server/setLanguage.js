const { EmbedBuilder } = require('discord.js');
const dbServerData = require('../../models/dbServerData');
const { getLanguage, t } = require('../../handlers/languageHandler');

module.exports = {
    name: 'set language',
    description: 'Sets the language for the server.',
    syntax:"ping",
    example:"ping",
    parameters:[],
    permissions:["Administrator"],
    async execute(message, args) {
        const language = await getLanguage(message.guild.id);

        const newLanguage = args[0];

        const availableLanguages = ['en', 'tr'];
        if (!availableLanguages.includes(newLanguage)) {
            return message.channel.send(t('languageSet_invalid_language', language, { languages: availableLanguages.join(', ') }));
        }

        try {
            await dbServerData.findOneAndUpdate(
                { serverId: message.guild.id },
                { language: newLanguage },
                { new: true, upsert: true }
            );

            const updatedLanguage = await getLanguage(message.guild.id);

            const embed = new EmbedBuilder()
                .setDescription(t('languageSet_set_description', updatedLanguage, { language: newLanguage }))
                .setColor(process.env.SUCCESS_COLOR);

            message.channel.send({ embeds: [embed] });
        } catch (error) {
            const embed = new EmbedBuilder()
                .setDescription(t('global_error_description', language))
                .setColor(process.env.ERROR_COLOR);

            message.channel.send({ embeds: [embed] });
        }
    },
};