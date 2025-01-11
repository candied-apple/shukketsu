const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getLanguage, t } = require('../../handlers/languageHandler');

module.exports = {
    name: 'nuke',
    description: 'Clones the current channel, deletes the old channel, and sends a message to the new channel.',
    category: 'server',
    syntax: 'nuke',
    example: 'nuke',
    parameters: [],
    paramOptional: true,
    flags: [],
    permissions: ['ManageGuild'],
    async execute(message, args) {
        try {
            const language = await getLanguage(message.guild.id);

            // Create confirmation buttons
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('confirm_nuke')
                    .setLabel('Yes')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('cancel_nuke')
                    .setLabel('No')
                    .setStyle(ButtonStyle.Secondary)
            );

            // Send confirmation message
            const confirmationEmbed = new EmbedBuilder()
                .setDescription(t('nuke_confirmation', language))
                .setColor(process.env.DEFAULT_COLOR);

            const confirmationMessage = await message.channel.send({
                embeds: [confirmationEmbed],
                components: [row]
            });

            // Create a collector to handle button interactions
            const filter = (interaction) => interaction.user.id === message.author.id;
            const collector = confirmationMessage.createMessageComponentCollector({ filter, time: 15000 });

            collector.on('collect', async (interaction) => {
                if (interaction.customId === 'confirm_nuke') {
                    // Clone the channel
                    const oldChannel = message.channel;
                    const newChannel = await oldChannel.clone();

                    // Delete the old channel
                    await oldChannel.delete();

                    // Get bot's profile photo
                    const botProfilePhoto = message.client.user.displayAvatarURL();

                    // Send a message to the new channel
                    const embed = new EmbedBuilder()
                        .setDescription(t('nuke_channel_cloned', language))
                        .setColor(process.env.DEFAULT_COLOR)
                        .setImage(botProfilePhoto)
                        .setFooter({
                            text: `${message.author.username}`,
                            iconURL: message.author.displayAvatarURL(),
                        })
                        .setTimestamp();

                    newChannel.send({ embeds: [embed] });
                } else if (interaction.customId === 'cancel_nuke') {
                    // Cancel the nuke operation
                    await interaction.reply({ content: t('nuke_cancelled', language), ephemeral: true });
                }

                // Disable buttons after interaction
                if (confirmationMessage.channel) {
                    await confirmationMessage.edit({ components: [] });
                }
                collector.stop();
            });

            collector.on('end', async () => {
                if (!collector.ended && confirmationMessage.channel) {
                    // Disable buttons after timeout
                    await confirmationMessage.edit({ components: [] });
                }
            });
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