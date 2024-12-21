const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const dbServerData = require('../../models/dbServerData');
const { getLanguage, t } = require('../../handlers/languageHandler');

module.exports = {
    name: 'levels list',
    description: 'View all ignored channels and roles for XP.',
    category: 'levels',
    syntax: 'levels list',
    example: 'levels list',
    parameters: [],
    paramOptional: false,
    flags: [],
    permissions: ['ManageGuild'],
    async execute(message) {
        const guildId = message.guild.id;
        const language = await getLanguage(guildId);

        try {
            const serverData = await dbServerData.findOne({ serverId: guildId });

            if (!serverData) {
                const embed = new EmbedBuilder()
                    .setColor(process.env.WARNING_COLOR)
                    .setDescription(t('levelsList_no_server_data', language));
                return message.channel.send({ embeds: [embed] });
            }

            const ignoredChannels = serverData.levelsIgnoredChannels.map(id => `<#${id}>`);
            const ignoredRoles = serverData.levelsIgnoredRoles.map(id => `<@&${id}>`);
            const data = [...ignoredChannels, ...ignoredRoles];

            if (data.length === 0) {
                const noIgnoredEmbed = new EmbedBuilder()
                    .setDescription(t('levelsList_no_ignored', language))
                    .setColor(process.env.WARNING_COLOR);
                return message.channel.send({ embeds: [noIgnoredEmbed] });
            }

            const itemsPerPage = 10;
            let currentPage = 0;

            const generateEmbed = (page) => {
                const start = page * itemsPerPage;
                const end = start + itemsPerPage;
                const currentItems = data.slice(start, end);

                const embed = new EmbedBuilder()
                    .setColor(process.env.DEFAULT_COLOR)
                    .setTitle(t('levelsList_channels_roles_title', language))
                    .setFooter({
                        text: t('global_page_footer', language, {
                            currentPage: page + 1,
                            totalPages: Math.ceil(data.length / itemsPerPage),
                            start: start + 1,
                            end: Math.min(end, data.length),
                            totalEntries: data.length
                        })
                    });

                currentItems.forEach(item => {
                    embed.addFields({ name: item.startsWith('<#') ? t('levelsList_ignored_channels', language) : t('levelsList_ignored_roles', language), value: item });
                });

                return embed;
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
                        .setDisabled(currentPage === Math.ceil(data.length / itemsPerPage) - 1)
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
                            .setDisabled(currentPage === Math.ceil(data.length / itemsPerPage) - 1)
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
            const embed = new EmbedBuilder()
                .setColor(process.env.ERROR_COLOR)
                .setDescription(t('global_error_description', language));
            message.channel.send({ embeds: [embed] });
        }
    },
};