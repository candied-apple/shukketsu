const { EmbedBuilder } = require('discord.js');
const { getLanguage, t } = require('../../handlers/languageHandler');

module.exports = {
    name: 'avatar',
    description: 'Displays the avatar of a specified user.',
    category: 'misc',
    syntax: 'avatar <user>',
    example: 'avatar @username',
    parameters: ['user'],
    flags: [],
    permissions: [],
    async execute(message, args) {
        try {
            const language = await getLanguage(message.guild.id);
            const user = message.mentions.users.first() || await message.client.users.fetch(args[0]);

            if (!user) {
                const embed = new EmbedBuilder()
                    .setColor(process.env.ERROR_COLOR)
                    .setDescription(t('avatar_user_not_found', language));
                return message.channel.send({ embeds: [embed] });
            }

            const embed = new EmbedBuilder()
                .setTitle(t('avatar_title', language, { username: user.username }))
                .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
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