const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const dbMemberData = require('../../models/dbMemberData');
const { getLanguage, t } = require('../../handlers/languageHandler');

module.exports = {
    name: 'levels leaderboard',
    description: 'View the highest ranking members.',
    category: 'server',
    syntax: 'levels leaderboard',
    example: 'levels leaderboard',
    parameters: [],
    paramOptional: true,
    flags: [],
    permissions: [],
    async execute(message, args) {
        try {
            const language = await getLanguage(message.guild.id);

            const topMembers = await dbMemberData.find({ serverId: message.guild.id })
                .sort({ xp: -1, level: -1 })
                .exec();

            if (topMembers.length === 0) {
                const noDataEmbed = new EmbedBuilder()
                    .setDescription(t('levelsLeaderboard_no_data', language))
                    .setColor(process.env.DEFAULT_COLOR);
                return message.channel.send({ embeds: [noDataEmbed] });
            }

            const itemsPerPage = 10;
            let currentPage = 0;

            const generateEmbed = (page) => {
                const start = page * itemsPerPage;
                const end = start + itemsPerPage;
                const currentMembers = topMembers.slice(start, end);

                const leaderboard = currentMembers.map((member, index) => 
                    `${start + index + 1}. <@${member.memberId}> - Level: ${member.level}, XP: ${member.xp}`
                ).join('\n');

                return new EmbedBuilder()
                    .setTitle(t('levelsLeaderboard_title', language))
                    .setDescription(leaderboard)
                    .setColor(process.env.DEFAULT_COLOR)
                    .setFooter({
                        text: t('global_page_footer', language, {
                            currentPage: page + 1,
                            totalPages: Math.ceil(topMembers.length / itemsPerPage),
                            start: start + 1,
                            end: Math.min(end, topMembers.length),
                            totalEntries: topMembers.length
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
                        .setDisabled(currentPage === Math.ceil(topMembers.length / itemsPerPage) - 1)
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
                            .setDisabled(currentPage === Math.ceil(topMembers.length / itemsPerPage) - 1)
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