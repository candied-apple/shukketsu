const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionsBitField } = require('discord.js');
const { getLanguage, t } = require('../../handlers/languageHandler');
const dbServerData = require('../../models/dbServerData');

module.exports = {
    name: 'ticket setup',
    description: 'Sets up a ticket system with a create button.',
    category: 'utility',
    syntax: 'ticket setup @mod',
    example: 'ticket setup @mod',
    parameters: ['modRole'],
    paramOptional: false,
    flags: [],
    permissions: ['Administrator'],
    async execute(message, args) {
        try {
            const language = await getLanguage(message.guild.id);

            if (!args[0] || !message.mentions.roles.first()) {
                return message.channel.send(t('ticket_setup_no_role', language));
            }

            const modRole = message.mentions.roles.first();

            // Save the mod role to the database
            await dbServerData.findOneAndUpdate(
                { serverId: message.guild.id },
                { ticketModRole: modRole.id },
                { upsert: true, new: true }
            );

            const embed = new EmbedBuilder()
                .setTitle(t('ticket_setup_title', language))
                .setDescription(t('ticket_setup_description', language))
                .setColor(process.env.DEFAULT_COLOR);

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('create_ticket')
                        .setLabel(t('ticket_create_button', language))
                        .setEmoji('🎫')
                        .setStyle(ButtonStyle.Primary)
                );

            await message.channel.send({ embeds: [embed], components: [row] });

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