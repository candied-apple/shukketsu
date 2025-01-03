const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getLanguage, t } = require('../../../handlers/languageHandler');
const dbServerData = require('../../../models/dbServerData');

const calculatePages = (dataLength, itemsPerPage) => {
    return Math.max(1, Math.ceil(dataLength / itemsPerPage));
};

function generateEmbed(data, page, itemsPerPage, language) {
    if (!data || data.length === 0) {
        return new EmbedBuilder()
            .setTitle(t('rss_list_no_data_title', language))
            .setDescription(t('rss_list_no_data_description', language))
            .setColor(process.env.WARNING_COLOR);
    }

    const start = page * itemsPerPage;
    const end = Math.min(start + itemsPerPage, data.length);
    const currentItems = data.slice(start, end);
    const totalPages = calculatePages(data.length, itemsPerPage);

    const embed = new EmbedBuilder()
        .setTitle(t('rss_list_title', language))
        .setColor(process.env.DEFAULT_COLOR)
        .setFooter({
            text: t('global_page_footer', language, {
                currentPage: page + 1,
                totalPages,
                start: data.length ? start + 1 : 0,
                end,
                totalEntries: data.length
            })
        });

    currentItems.forEach(item => {
        embed.addFields({ name: item.name, value: item.value });
    });

    return embed;
}

function createButtons(currentPage, totalItems, itemsPerPage) {
    const totalPages = calculatePages(totalItems, itemsPerPage);

    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('previous')
                .setEmoji('<:left:1276955776442958015>')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(currentPage === 0 || totalItems === 0),
            new ButtonBuilder()
                .setCustomId('next')
                .setEmoji('<:right:1276955810806763571>')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(currentPage >= totalPages - 1 || totalItems === 0)
        );
}

async function paginate(message, data, itemsPerPage, language) {
    let currentPage = 0;

    if (!data || data.length === 0) {
        const embed = generateEmbed([], 0, itemsPerPage, language);
        return message.channel.send({ embeds: [embed] });
    }

    const embed = generateEmbed(data, currentPage, itemsPerPage, language);
    const buttons = createButtons(currentPage, data.length, itemsPerPage);

    const messageEmbed = await message.channel.send({
        embeds: [embed],
        components: [buttons]
    });

    const filter = i => i.user.id === message.author.id;
    const collector = messageEmbed.createMessageComponentCollector({
        filter,
        time: 60000
    });

    collector.on('collect', async interaction => {
        currentPage = interaction.customId === 'previous' ?
            Math.max(0, currentPage - 1) :
            Math.min(calculatePages(data.length, itemsPerPage) - 1, currentPage + 1);

        const newEmbed = generateEmbed(data, currentPage, itemsPerPage, language);
        const newButtons = createButtons(currentPage, data.length, itemsPerPage);

        await interaction.update({
            embeds: [newEmbed],
            components: [newButtons]
        });
    });

    collector.on('end', () => {
        const disabledButtons = createButtons(currentPage, data.length, itemsPerPage)
            .components.map(button => button.setDisabled(true));

        messageEmbed.edit({
            components: [new ActionRowBuilder().addComponents(disabledButtons)]
        });
    });
}

module.exports = {
    name: 'rss list',
    description: 'Lists all RSS feeds for the server.',
    category: 'rss',
    syntax: 'rss list',
    example: 'rss list',
    parameters: [],
    paramOptional: true,
    flags: [],
    permissions: ['Administrator'],
    async execute(message, args) {
        try {
            const language = await getLanguage(message.guild.id);

            // Fetch the server data from the database
            const serverData = await dbServerData.findOne({ serverId: message.guild.id });

            if (!serverData || !serverData.rssFeeds || serverData.rssFeeds.length === 0) {
                const embed = new EmbedBuilder()
                    .setDescription(t('rss_list_no_feeds', language))
                    .setColor(process.env.WARNING_COLOR);
                return message.channel.send({ embeds: [embed] });
            }

            const itemsPerPage = 5; // Adjust the number of items per page as needed

            const data = serverData.rssFeeds.map(feed => ({
                name: `Channel: <#${feed.channelId}>`,
                value: `URL: ${feed.url}`
            }));

            await paginate(message, data, itemsPerPage, language);
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