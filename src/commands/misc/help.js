const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getLanguage, t } = require('../../handlers/languageHandler');

module.exports = {
    name: 'help',
    description: 'Displays a help menu with all commands categorized.',
    category: 'server',
    syntax: 'help',
    example: 'help',
    parameters: [],
    flags: [],
    async execute(message, args) {
        const commands = message.client.commands;
        const categories = [...new Set(commands.map(cmd => cmd.category).filter(category => category))];
        const language = await getLanguage(message.guild.id);

        const generateEmbed = (category, page) => {
            const commandsInCategory = commands.filter(cmd => cmd.category === category);
            const commandsArray = Array.from(commandsInCategory.values());
            const itemsPerPage = 5;
            const totalPages = Math.ceil(commandsArray.length / itemsPerPage);
            const start = page * itemsPerPage;
            const end = start + itemsPerPage;
            const currentCommands = commandsArray.slice(start, end);

            const embed = new EmbedBuilder()
                .setTitle(`${category} Commands`)
                .setColor(process.env.DEFAULT_COLOR)
                .setFooter({
                    text: t('global_page_footer', language, {
                        currentPage: page + 1,
                        totalPages: totalPages || 1,
                        start: commandsArray.length ? start + 1 : 0,
                        end: Math.min(end, commandsArray.length),
                        totalEntries: commandsArray.length
                    })
                });

            if (currentCommands.length === 0) {
                embed.setDescription('No commands found in this category.');
            } else {
                currentCommands.forEach(cmd => {
                    embed.addFields({ name: cmd.name, value: cmd.description });
                });
            }

            return { embed, totalPages };
        };

        const categoryOptions = categories.map(category => ({
            label: category,
            value: category
        }));

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select-category')
            .setPlaceholder('Select a category')
            .addOptions(categoryOptions);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        const initialEmbed = new EmbedBuilder()
            .setTitle('Help Menu')
            .setDescription('Please select a category to view commands.')
            .setColor(process.env.DEFAULT_COLOR);

        const messageEmbed = await message.channel.send({ embeds: [initialEmbed], components: [row] });

        const filter = interaction => interaction.user.id === message.author.id;
        const collector = messageEmbed.createMessageComponentCollector({ filter, time: 60000 });

        let currentCategory = null;
        let currentPage = 0;

        collector.on('collect', async interaction => {
            if (interaction.isStringSelectMenu()) {
                currentCategory = interaction.values[0];
                currentPage = 0;

                const { embed, totalPages } = generateEmbed(currentCategory, currentPage);
                
                const buttons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('previous')
                            .setEmoji('<:left:1276955776442958015>')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(currentPage === 0 || totalPages <= 1),
                        new ButtonBuilder()
                            .setCustomId('next')
                            .setEmoji('<:right:1276955810806763571>')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(currentPage >= totalPages - 1 || totalPages <= 1)
                    );

                await interaction.update({ embeds: [embed], components: [row, buttons] });
            } else if (interaction.isButton()) {
                if (interaction.customId === 'previous') {
                    currentPage--;
                } else if (interaction.customId === 'next') {
                    currentPage++;
                }

                const { embed, totalPages } = generateEmbed(currentCategory, currentPage);
                
                const buttons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('previous')
                            .setEmoji('<:left:1276955776442958015>')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(currentPage === 0 || totalPages <= 1),
                        new ButtonBuilder()
                            .setCustomId('next')
                            .setEmoji('<:right:1276955810806763571>')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(currentPage >= totalPages - 1 || totalPages <= 1)
                    );

                await interaction.update({ embeds: [embed], components: [row, buttons] });
            }
        });

        collector.on('end', () => {
            const disabledRow = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('select-category')
                        .setPlaceholder('Select a category')
                        .setDisabled(true)
                        .addOptions(categoryOptions)
                );

            messageEmbed.edit({ components: [disabledRow] });
        });
    }
};