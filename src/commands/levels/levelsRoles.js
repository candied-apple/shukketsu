const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getLanguage, t } = require('../../handlers/languageHandler');
const dbServerData = require('../../models/dbServerData');

module.exports = {
    name: 'levels roles',
    description: 'View all level roles',
    category: 'levels',
    syntax: 'levels roles',
    example: 'levels roles',
    parameters: [],
    paramOptional: false,
    flags: [],
    permissions: [],
    async execute(message) {
        try {
            const language = await getLanguage(message.guild.id);
            const serverData = await dbServerData.findOne({ serverId: message.guild.id });

            if (!serverData || !serverData.levelRoles.size) {
                return message.channel.send(t('levelsRoles_no_roles', language));
            }

            const rolesArray = Array.from(serverData.levelRoles.entries())
                .sort((a, b) => a[1] - b[1])
                .map(([roleId, level]) => `<@&${roleId}>: ${level}`);

            const itemsPerPage = 10;
            let currentPage = 0;

            const generateEmbed = (page) => {
                const start = page * itemsPerPage;
                const end = start + itemsPerPage;
                const currentRoles = rolesArray.slice(start, end).join('\n');

                return new EmbedBuilder()
                    .setTitle(t('levelsRoles_title', language))
                    .setDescription(currentRoles)
                    .setColor(process.env.DEFAULT_COLOR)
                    .setFooter({
                        text: t('global_page_footer', language, {
                            currentPage: page + 1,
                            totalPages: Math.ceil(rolesArray.length / itemsPerPage),
                            start: start + 1,
                            end: Math.min(end, rolesArray.length),
                            totalEntries: rolesArray.length
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
                        .setDisabled(currentPage === Math.ceil(rolesArray.length / itemsPerPage) - 1)
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
                            .setDisabled(currentPage === Math.ceil(rolesArray.length / itemsPerPage) - 1)
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