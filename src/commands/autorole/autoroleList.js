const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const dbServerData = require('../../models/dbServerData');
const { getLanguage, t } = require('../../handlers/languageHandler');

module.exports = {
    name: 'autorole list',
    description: 'View a list of every autorole.',
    category: 'server',
    syntax: 'autorole list',
    example: 'autorole list',
    parameters: [],
    paramOptional: false,
    flags: [],
    permissions: ['ManageGuild'],
    async execute(message) {
        try {
            const serverData = await dbServerData.findOne({ serverId: message.guild.id });
            if (!serverData) {
                const language = await getLanguage(message.guild.id);
                const embed = new EmbedBuilder()
                    .setColor(process.env.WARNING_COLOR)
                    .setDescription(t('autorole_list_no_data', language));
                return message.channel.send({ embeds: [embed] });
            }

            const autoroles = serverData.autoroles || [];
            const itemsPerPage = 10;
            let currentPage = 0;

            const language = await getLanguage(message.guild.id);

            const generateEmbed = (page) => {
                const start = page * itemsPerPage;
                const end = start + itemsPerPage;
                const currentRoles = autoroles.slice(start, end);

                const roleDescriptions = currentRoles.map(roleId => {
                    const role = message.guild.roles.cache.get(roleId);
                    return role ? `${role} (${roleId})` : `Unknown Role (${roleId})`;
                });

                return new EmbedBuilder()
                    .setColor(process.env.DEFAULT_COLOR)
                    .setTitle(t('autorole_list_title', language))
                    .setDescription(roleDescriptions.length > 0 ? roleDescriptions.join('\n') : t('autorole_list_empty', language))
                    .setFooter({
                        text: t('global_page_footer', language, {
                            currentPage: page + 1,
                            totalPages: Math.ceil(autoroles.length / itemsPerPage),
                            start: start + 1,
                            end: Math.min(end, autoroles.length),
                            totalEntries: autoroles.length
                        })
                    });
            };

            const embed = generateEmbed(currentPage);

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('previous')
                        .setEmoji('<:left:1276955776442958015>')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(currentPage === 0),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setEmoji('<:right:1276955810806763571>')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(currentPage >= Math.ceil(autoroles.length / itemsPerPage) - 1)
                );

            const messageEmbed = await message.channel.send({ embeds: [embed], components: [row] });

            const filter = (interaction) => ['previous', 'next'].includes(interaction.customId) && interaction.user.id === message.author.id;
            const collector = messageEmbed.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async (interaction) => {
                if (interaction.customId === 'previous') {
                    currentPage--;
                } else if (interaction.customId === 'next') {
                    currentPage++;
                }

                const newEmbed = generateEmbed(currentPage);

                const newRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('previous')
                            .setEmoji('<:left:1276955776442958015>')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(currentPage === 0),
                        new ButtonBuilder()
                            .setCustomId('next')
                            .setEmoji('<:right:1276955810806763571>')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(currentPage >= Math.ceil(autoroles.length / itemsPerPage) - 1)
                    );

                await interaction.update({ embeds: [newEmbed], components: [newRow] });
            });

            collector.on('end', () => {
                const disabledRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('previous')
                            .setEmoji('<:left:1276955776442958015>')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(true),
                        new ButtonBuilder()
                            .setCustomId('next')
                            .setEmoji('<:right:1276955810806763571>')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(true)
                    );
                messageEmbed.edit({ components: [disabledRow] });
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