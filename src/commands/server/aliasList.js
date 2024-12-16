const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const dbServerData = require('../../models/dbServerData');
const { getLanguage, t } = require('../../handlers/languageHandler');

module.exports = {
    name: 'alias list',
    description: 'List all aliases for all commands',
    syntax: 'alias list',
    example: 'alias list',
    permissions: ['Administrator'],
    parameters: [],
    async execute(message) {
        const language = await getLanguage(message.guild.id);

        try {
            const serverData = await dbServerData.findOne({ serverId: message.guild.id });
            const aliases = serverData?.aliases || new Map();

            if (aliases.size === 0) {
                const noAliasesEmbed = new EmbedBuilder()
                    .setDescription(t('aliasList_no_aliases', language))
                    .setColor(process.env.WARNING_COLOR);
                return message.channel.send({ embeds: [noAliasesEmbed] });
            }

            const aliasesArray = Array.from(aliases.entries());
            const itemsPerPage = 10;
            let currentPage = 0;

            const generateEmbed = (page) => {
                const start = page * itemsPerPage;
                const end = start + itemsPerPage;
                const currentAliases = aliasesArray.slice(start, end);

                let description = '';
                for (const [commandName, commandAliases] of currentAliases) {
                    description += `**${commandName}**: \`${commandAliases.join(', ')}\`\n`;
                }

                return new EmbedBuilder()
                    .setTitle(t('aliasList_all_aliases', language))
                    .setDescription(description)
                    .setColor(process.env.DEFAULT_COLOR)
                    .setFooter({
                        text: t('page_footer', language, {
                            currentPage: page + 1,
                            totalPages: Math.ceil(aliasesArray.length / itemsPerPage),
                            start: start + 1,
                            end: Math.min(end, aliasesArray.length),
                            totalEntries: aliasesArray.length
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
                        .setDisabled(currentPage === Math.ceil(aliasesArray.length / itemsPerPage) - 1)
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
                            .setDisabled(currentPage === Math.ceil(aliasesArray.length / itemsPerPage) - 1)
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
            const errorEmbed = new EmbedBuilder()
                .setDescription(t('global_error_description', language))
                .setColor(process.env.ERROR_COLOR);
            message.channel.send({ embeds: [errorEmbed] });
        }
    }
};