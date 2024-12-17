const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const dbServerData = require('../../../models/dbServerData');
const { getLanguage, t } = require('../../../handlers/languageHandler');

function generateEmbed(welcomeMessages, page, itemsPerPage, language, channelName) {
    const start = page * itemsPerPage;
    const end = start + itemsPerPage;
    const currentMessages = welcomeMessages.slice(start, end);

    const embed = new EmbedBuilder()
        .setTitle(t('welcomeView_welcome_messages_for_channel', language, { channel: channelName }))
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
        embed.addFields({ name: `${start + index + 1}.`, value: msg.message });
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

async function paginate(message, welcomeMessages, itemsPerPage, language, channelName) {
    let currentPage = 0;
    const totalPages = Math.ceil(welcomeMessages.length / itemsPerPage);

    const embed = generateEmbed(welcomeMessages, currentPage, itemsPerPage, language, channelName);
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

        const newEmbed = generateEmbed(welcomeMessages, currentPage, itemsPerPage, language, channelName);
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
    name: 'welcome view',
    description: 'View welcome message for a channel',
    category: 'server',
    syntax: 'welcome view <channel>',
    example: 'welcome view #general',
    parameters: ['channel'],
    flags: [],
    permissions: ['ManageGuild'],
    async execute(message, args) {
        const language = await getLanguage(message.guild.id);
        const channel = message.mentions.channels.first();

        if (!channel) {
            return message.channel.send(t('welcomeView_provide_channel', language));
        }

        try {
            const serverData = await dbServerData.findOne({ serverId: message.guild.id });
            const welcomeMessages = serverData.welcomeMessages.filter(msg => msg.channelId === channel.id);

            if (!welcomeMessages.length) {
                return message.channel.send(t('welcomeView_no_welcome_message', language, { channel: channel.name }));
            }

            paginate(message, welcomeMessages, 5, language, channel.name);
        } catch (error) {
            console.error(error);
            const embed = new EmbedBuilder()
                .setColor(process.env.ERROR_COLOR)
                .setDescription(t('global_error_description', language));
            message.channel.send({ embeds: [embed] });
        }
    },
};