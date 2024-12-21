const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const dbServerData = require('../../models/dbServerData');
const { getLanguage, t } = require('../../handlers/languageHandler');

module.exports = {
    name: 'levels config',
    description: 'View server configuration for Leveling system',
    category: 'server',
    syntax: 'levels config',
    example: 'levels config',
    parameters: [],
    flags: [],
    permissions: ['ManageGuild'],
    async execute(message) {
        const language = await getLanguage(message.guild.id);

        try {
            const serverData = await dbServerData.findOne({ serverId: message.guild.id });

            if (!serverData) {
                const noConfigEmbed = new EmbedBuilder()
                    .setDescription(t('levelsConfig_no_config', language))
                    .setColor(process.env.WARNING_COLOR);
                return message.channel.send({ embeds: [noConfigEmbed] });
            }

            const configOptions = [
                { label: 'XP Multiplier', value: 'xpMultiplier' },
                { label: 'Ignored Channels', value: 'levelsIgnoredChannels' },
                { label: 'Ignored Roles', value: 'levelsIgnoredRoles' },
                { label: 'Levels Enabled', value: 'levelsEnabled' },
                { label: 'Levels Message', value: 'levelsMessage' },
                { label: 'Level Stack Roles', value: 'levelStackroles' },
                { label: 'Message Mode', value: 'levelsMessageMode' } // Added Message Mode option
            ];

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('selectConfigOption')
                .setPlaceholder('Select a configuration option')
                .addOptions(configOptions);

            const menuRow = new ActionRowBuilder().addComponents(selectMenu);

            const initialEmbed = new EmbedBuilder()
                .setTitle(t('levelsConfig_title', language))
                .setDescription(t('levelsConfig_select_option', language))
                .setColor(process.env.DEFAULT_COLOR);

            const messageEmbed = await message.channel.send({
                embeds: [initialEmbed],
                components: [menuRow]
            });

            let currentPage = 0;
            let currentView = null;
            let paginationData = null;

            const menuFilter = i => i.customId === 'selectConfigOption' && i.user.id === message.author.id;
            const buttonFilter = i => (i.customId === 'previous' || i.customId === 'next') && i.user.id === message.author.id;

            const menuCollector = messageEmbed.createMessageComponentCollector({
                filter: menuFilter,
                time: 60000
            });

            const buttonCollector = messageEmbed.createMessageComponentCollector({
                filter: buttonFilter,
                time: 60000
            });

            menuCollector.on('collect', async interaction => {
                const selectedOption = interaction.values[0];
                currentView = selectedOption;
                currentPage = 0;
                let components = [menuRow];

                let embed;
                switch (selectedOption) {
                    case 'xpMultiplier':
                        embed = new EmbedBuilder()
                            .setTitle(t('levelsConfig_xpMultiplier_title', language))
                            .setDescription(t('levelsConfig_xpMultiplier_description', language, {
                                xpMultiplier: serverData.xpMultiplier
                            }))
                            .setColor(process.env.DEFAULT_COLOR);
                        break;

                    case 'levelsIgnoredChannels':
                        paginationData = generatePaginatedData(
                            serverData.levelsIgnoredChannels,
                            'levelsConfig_ignoredChannels',
                            language,
                            currentPage,
                            'channel'
                        );
                        embed = paginationData.embed;
                        if (serverData.levelsIgnoredChannels.length > 0) {
                            components.push(paginationData.row);
                        }
                        break;

                    case 'levelsIgnoredRoles':
                        paginationData = generatePaginatedData(
                            serverData.levelsIgnoredRoles,
                            'levelsConfig_ignoredRoles',
                            language,
                            currentPage,
                            'role'
                        );
                        embed = paginationData.embed;
                        if (serverData.levelsIgnoredRoles.length > 0) {
                            components.push(paginationData.row);
                        }
                        break;

                    case 'levelsEnabled':
                        embed = new EmbedBuilder()
                            .setTitle(t('levelsConfig_levelsEnabled_title', language))
                            .setDescription(t('levelsConfig_levelsEnabled_description', language, {
                                levelsEnabled: serverData.levelsEnabled
                            }))
                            .setColor(process.env.DEFAULT_COLOR);
                        break;

                    case 'levelsMessage':
                        embed = new EmbedBuilder()
                            .setTitle(t('levelsConfig_levelsMessage_title', language))
                            .setDescription(t('levelsConfig_levelsMessage_description', language, {
                                levelsMessage: serverData.levelsMessage
                            }))
                            .setColor(process.env.DEFAULT_COLOR);
                        break;

                    case 'levelStackroles':
                        embed = new EmbedBuilder()
                            .setTitle(t('levelsConfig_levelStackroles_title', language))
                            .setDescription(t('levelsConfig_levelStackroles_description', language, {
                                levelStackroles: serverData.levelStackroles
                            }))
                            .setColor(process.env.DEFAULT_COLOR);
                        break;

                    case 'levelsMessageMode': // Handle Message Mode option
                        embed = new EmbedBuilder()
                            .setTitle(t('levelsConfig_levelsMessageMode_title', language))
                            .setDescription(t('levelsConfig_levelsMessageMode_description', language, {
                                levelsMessageMode: serverData.levelsMessageMode
                            }))
                            .setColor(process.env.DEFAULT_COLOR);
                        break;
                }

                await interaction.update({ embeds: [embed], components });
            });

            buttonCollector.on('collect', async interaction => {
                if (!paginationData) return;

                if (interaction.customId === 'previous') {
                    currentPage = Math.max(0, currentPage - 1);
                } else if (interaction.customId === 'next') {
                    currentPage = Math.min(paginationData.totalPages - 1, currentPage + 1);
                }

                const newPaginationData = generatePaginatedData(
                    currentView === 'levelsIgnoredChannels' ?
                        serverData.levelsIgnoredChannels :
                        serverData.levelsIgnoredRoles,
                    currentView === 'levelsIgnoredChannels' ?
                        'levelsConfig_ignoredChannels' :
                        'levelsConfig_ignoredRoles',
                    language,
                    currentPage,
                    currentView === 'levelsIgnoredChannels' ? 'channel' : 'role'
                );

                await interaction.update({
                    embeds: [newPaginationData.embed],
                    components: [menuRow, newPaginationData.row]
                });
            });

            menuCollector.on('end', () => {
                const disabledRow = new ActionRowBuilder().addComponents(
                    selectMenu.setDisabled(true)
                );
                messageEmbed.edit({ components: [disabledRow] });
            });

        } catch (error) {
            console.error(error);
            const errorEmbed = new EmbedBuilder()
                .setDescription(t('global_error_description', language))
                .setColor(process.env.ERROR_COLOR);
            message.channel.send({ embeds: [errorEmbed] });
        }
    }
};

function generatePaginatedData(items, key, language, page, type) {
    const itemsPerPage = 10;
    const totalPages = Math.ceil(items.length / itemsPerPage);
    const start = page * itemsPerPage;
    const end = start + itemsPerPage;
    const currentItems = items.slice(start, end);

    const description = currentItems.length > 0
        ? currentItems.map(item => type === 'channel' ? `<#${item}> (${item})` : `<@&${item}> (${item})`).join('\n')
        : t('levelsConfig_no_items', language);

    const embed = new EmbedBuilder()
        .setTitle(t(`${key}_title`, language))
        .setDescription(description)
        .setColor(process.env.DEFAULT_COLOR)
        .setFooter({
            text: t('global_page_footer', language, {
                currentPage: page + 1,
                totalPages,
                start: start + 1,
                end: Math.min(end, items.length),
                totalEntries: items.length
            })
        });

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('previous')
                .setEmoji('<:left:1276955776442958015>')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(page === 0),
            new ButtonBuilder()
                .setCustomId('next')
                .setEmoji('<:right:1276955810806763571>')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(page === totalPages - 1)
        );

    return { embed, row, totalPages };
}