const { EmbedBuilder } = require('discord.js');
const { parseEmbedScript } = require('../../handlers/embedScriptHandler');
const { getLanguage, t } = require('../../handlers/languageHandler');

module.exports = {
    name: 'sendembed',
    description: 'Send an embed using an embed script.',
    category: 'misc',
    syntax: 'sendembed <channel> <embedScript>',
    example: 'sendembed #general {embed}$v{title: Hello}$v{description: This is an embed}',
    parameters: ['channel', 'embedScript'],
    flags: [],
    permissions: ['Administrator'],
    async execute(message, args) {
        const language = await getLanguage(message.guild.id);
        const channel = message.mentions.channels.first();
        const embedScript = args.slice(1).join(' ');

        if (!channel || !embedScript) {
            return message.channel.send(t('sendembed_provide_channel_and_script', language));
        }

        try {
            const data = {
                guild: message.guild,
                user: message.author,
                member: message.member,
                channel: channel
            };

            const { embed, messageContent } = parseEmbedScript(embedScript, data);

            if (!embed && !messageContent) {
                return message.channel.send(t('sendembed_invalid_script', language));
            }

            await channel.send({ content: messageContent, embeds: embed ? [embed] : [] });

        } catch (error) {
            console.error(error);
            const errorEmbed = new EmbedBuilder()
                .setColor(process.env.ERROR_COLOR)
                .setDescription(t('global_error_description', language));
            message.channel.send({ embeds: [errorEmbed] });
        }
    },
};