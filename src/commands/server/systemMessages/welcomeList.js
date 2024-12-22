const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const dbServerData = require('../../../models/dbServerData');
const { getLanguage, t } = require('../../../handlers/languageHandler');

function generateEmbed(welcomeMessages, page, itemsPerPage, language) {
    const start = page * itemsPerPage;
    const end = start + itemsPerPage;
    const currentMessages = welcomeMessages.slice(start, end);

    const embed = new EmbedBuilder()
        .setTitle(t('welcomeList_welcome_messages_list', language))
        .setColor(process.env.DEFAULT_COLOR)
        .setFooter({
            text: t('global_page_footer', language, {
                currentPage: page + 1,
                totalPages: Math.ceil(welcomeMessages.length / itemsPerPage),
                start: start + 1,
                end: Math.min(end, welcomeMessages.length),
                totalEntries: welcomeMessages.length
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

async function paginate(message, welcomeMessages, itemsPerPage, language) {
    let currentPage = 0;
    const totalPages = Math.ceil(welcomeMessages.length / itemsPerPage);

    const embed = generateEmbed(welcomeMessages, currentPage, itemsPerPage, language);
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

        const newEmbed = generateEmbed(welcomeMessages, currentPage, itemsPerPage, language);
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
    name: 'welcome list',
    description: 'View all welcome messages',
    category: 'server',
    syntax: 'welcome list',
    example: 'welcome list',
    parameters: [],
    flags: [],
    permissions: ['ManageGuild'],
    async execute(message) {
        const language = await getLanguage(message.guild.id);

        try {
            const serverData = await dbServerData.findOne({ serverId: message.guild.id });
            const welcomeMessages = serverData.welcomeMessages;

            if (!welcomeMessages.length) {
                const noMessagesEmbed = new EmbedBuilder()
                    .setColor(process.env.DEFAULT_COLOR)
                    .setDescription(t('welcomeList_no_welcome_messages', language));
                return message.channel.send({ embeds: [noMessagesEmbed] });
            }

            paginate(message, welcomeMessages, 5, language);
        } catch (error) {
            console.error(error);
            const errorEmbed = new EmbedBuilder()
                .setColor(process.env.ERROR_COLOR)
                .setDescription(t('global_error_description', language));
            message.channel.send({ embeds: [errorEmbed] });
        }
    },
};