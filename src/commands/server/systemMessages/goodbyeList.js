const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const dbServerData = require('../../../models/dbServerData');
const { getLanguage, t } = require('../../../handlers/languageHandler');

function generateEmbed(goodbyeMessages, page, itemsPerPage, language) {
    const start = page * itemsPerPage;
    const end = start + itemsPerPage;
    const currentMessages = goodbyeMessages.slice(start, end);

    const embed = new EmbedBuilder()
        .setTitle(t('goodbyeList_goodbye_messages_list', language))
        .setColor(process.env.DEFAULT_COLOR)
        .setFooter({
            text: t('global_page_footer', language, {
                currentPage: page + 1,
                totalPages: Math.ceil(goodbyeMessages.length / itemsPerPage),
                start: start + 1,
                end: Math.min(end, goodbyeMessages.length),
                totalEntries: goodbyeMessages.length
            })
        });

    currentMessages.forEach((msg, index) => {
        embed.addFields({ name: `<#${msg.channelId}>`, value: msg.message });
    });

    return embed;
}

function createButtons(currentPage, totalPages) {
    return new ActionRowBuilder()
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
                .setDisabled(currentPage === totalPages - 1)
        );
}

async function paginate(message, goodbyeMessages, itemsPerPage, language) {
    let currentPage = 0;
    const totalPages = Math.ceil(goodbyeMessages.length / itemsPerPage);

    const embed = generateEmbed(goodbyeMessages, currentPage, itemsPerPage, language);
    const buttons = createButtons(currentPage, totalPages);

    const messageEmbed = await message.channel.send({ embeds: [embed], components: [buttons] });

    const filter = interaction => ['previous', 'next'].includes(interaction.customId) && interaction.user.id === message.author.id;
    const collector = messageEmbed.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async interaction => {
        if (interaction.customId === 'previous') {
            currentPage--;
        } else if (interaction.customId === 'next') {
            currentPage++;
        }

        const newEmbed = generateEmbed(goodbyeMessages, currentPage, itemsPerPage, language);
        const newButtons = createButtons(currentPage, totalPages);

        await interaction.update({ embeds: [newEmbed], components: [newButtons] });
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
}

module.exports = {
    name: 'goodbye list',
    description: 'View all goodbye messages',
    category: 'server',
    syntax: 'goodbye list',
    example: 'goodbye list',
    parameters: [],
    flags: [],
    permissions: ['ManageGuild'],
    async execute(message) {
        const language = await getLanguage(message.guild.id);

        try {
            const serverData = await dbServerData.findOne({ serverId: message.guild.id });
            const goodbyeMessages = serverData.goodbyeMessages;

            if (!goodbyeMessages.length) {
                return message.channel.send(t('goodbyeList_no_goodbye_messages', language));
            }

            paginate(message, goodbyeMessages, 5, language);
        } catch (error) {
            console.error(error);
            const embed = new EmbedBuilder()
                .setColor(process.env.ERROR_COLOR)
                .setDescription(t('global_error_description', language));
            message.channel.send({ embeds: [embed] });
        }
    },
};