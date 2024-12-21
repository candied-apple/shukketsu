const { EmbedBuilder } = require('discord.js');
const { getLanguage, t } = require('../../handlers/languageHandler');

module.exports = {
    name: 'banner',
    description: 'Displays the banner of a specified user.',
    category: 'user',
    syntax: 'banner <user>',
    example: 'banner @username',
    parameters: ['user'],
    flags: [],
    permissions: [],
    async execute(message, args) {
        try {
            const language = await getLanguage(message.guild.id);
            const user = message.mentions.users.first() || await message.client.users.fetch(args[0]);

            if (!user) {
                const embed = new EmbedBuilder()
                    .setColor(process.env.WARNING_COLOR)
                    .setDescription(t('banner_user_not_found', language));
                return message.channel.send({ embeds: [embed] });
            }

            const userBanner = await user.fetch().then(u => u.bannerURL({ dynamic: true, size: 1024 }));

            if (!userBanner) {
                const embed = new EmbedBuilder()
                    .setColor(process.env.WARNING_COLOR)
                    .setDescription(t('banner_not_found', language));
                return message.channel.send({ embeds: [embed] });
            }

            const embed = new EmbedBuilder()
                .setTitle(t('banner_title', language, { username: user.username }))
                .setImage(userBanner)
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