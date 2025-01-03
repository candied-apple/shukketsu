const { EmbedBuilder, ChannelType } = require('discord.js');
const { getLanguage, t } = require('../handlers/languageHandler');
const dbServerData = require('../models/dbServerData');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (!interaction.isButton()) return;

        try {
            const language = await getLanguage(interaction.guild.id);
            const ticketNumber = await Math.floor(1000 + Math.random() * 9000);

            if (interaction.customId === 'create_ticket') {
                const thread = await interaction.channel.threads.create({
                    name: `${ticketNumber}-${interaction.user.username}`,
                    autoArchiveDuration: 10080,
                    type: ChannelType.PrivateThread,
                    reason: 'Ticket created',
                    invitable: false,
                });

                await thread.members.add(interaction.user.id);

                const threadEmbed = new EmbedBuilder()
                    .setTitle(t('ticket_thread_title', language, { tickedId: ticketNumber }))
                    .setDescription(t('ticket_thread_description', language, { user: interaction.user }))
                    .setColor(process.env.DEFAULT_COLOR)
                    .setTimestamp();

                const serverData = await dbServerData.findOne({ serverId: interaction.guild.id });
                const modRoleMention = serverData.ticketModRole ? `<@&${serverData.ticketModRole}>` : '';

                if (modRoleMention) {
                    await thread.send({ content: modRoleMention });
                }
                await thread.send({ embeds: [threadEmbed] });

                interaction.reply({ content: `Ticket created: ${thread}`, ephemeral: true });
            }
        } catch (error) {
            console.error('Error creating ticket:', error);
            const language = await getLanguage(interaction.guild.id);
            interaction.reply({ content: t('global_error_description', language), ephemeral: true });
        }
    },
};