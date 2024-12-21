const { EmbedBuilder } = require('discord.js');
const dbUserData = require('../../models/dbUserData');
const { getLanguage, t } = require('../../handlers/languageHandler');

module.exports = {
    name: 'levels messages',
    description: 'Toggle level up messages for yourself.',
    category: 'user',
    syntax: 'levels messages <setting>',
    example: 'levels messages on',
    parameters: ['setting'],
    paramOptional: false,
    flags: [],
    permissions: [],
    async execute(message, args) {
        try {
            const setting = args[0].toLowerCase() === 'on';
            const userId = message.author.id;

            const user = await dbUserData.findOneAndUpdate(
                { userId },
                { levelsMessagesEnabled: setting },
                { new: true, upsert: true }
            );

            const language = await getLanguage(message.guild.id);
            const embed = new EmbedBuilder()
                .setDescription(t('levelsMessages_toggle', language, { setting: setting ? 'on' : 'off' }))
                .setColor(process.env.DEFAULT_COLOR);

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