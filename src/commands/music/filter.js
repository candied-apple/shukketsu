const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { getLanguage, t } = require('../../handlers/languageHandler');

module.exports = {
    name: 'filter',
    description: 'Apply audio filters to the current music player',
    category: 'music',
    syntax: 'filter',
    example: 'filter',
    parameters: [],
    paramOptional: false,
    flags: [],
    permissions: [],
    async execute(message) {
        try {
            const language = await getLanguage(message.guild.id);
            const player = message.client.kazagumo.players.get(message.guild.id);

            if (!player) {
                const embed = new EmbedBuilder()
                    .setColor(process.env.ERROR_COLOR)
                    .setDescription(t('filter_no_player', language));
                return message.channel.send({ embeds: [embed] });
            }

            const filters = [
                'clear', 'eightD', 'soft', 'speed', 'karaoke', 'nightcore', 'pop', 'vaporwave', 'bass', 'party', 'earrape', 'equalizer', 'electronic', 'radio', 'tremolo', 'treblebass', 'vibrato', 'china', 'chimpunk', 'darthvader', 'daycore', 'doubletime', 'pitch', 'rate', 'slow'
            ];

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('select-filter')
                .setPlaceholder(t('filter_select_placeholder', language))
                .addOptions(filters.map(filter => ({
                    label: filter,
                    value: filter
                })));

            const row = new ActionRowBuilder().addComponents(selectMenu);

            const embed = new EmbedBuilder()
                .setColor(process.env.DEFAULT_COLOR)
                .setDescription(t('filter_select_description', language));

            const messageEmbed = await message.channel.send({ embeds: [embed], components: [row] });

            const filter = interaction => interaction.customId === 'select-filter' && interaction.user.id === message.author.id;
            const collector = messageEmbed.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async interaction => {
                const selectedFilter = interaction.values[0];
                await player.filter(selectedFilter);

                const successEmbed = new EmbedBuilder()
                    .setColor(process.env.SUCCESS_COLOR)
                    .setDescription(t('filter_applied', language, { filter: selectedFilter }));

                await interaction.update({ embeds: [successEmbed], components: [] });
            });

            collector.on('end', () => {
                const disabledRow = new ActionRowBuilder().addComponents(selectMenu.setDisabled(true));
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