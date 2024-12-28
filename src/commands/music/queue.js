const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getLanguage, t } = require('../../handlers/languageHandler');

module.exports = {
  name: 'queue',
  description: 'Display the current music queue',
  category: 'music',
  syntax: 'queue',
  example: 'queue',
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
          .setDescription(t('queue_no_player', language));
        return message.channel.send({ embeds: [embed] });
      }

      const queue = player.queue;
      if (!queue.length) {
        const embed = new EmbedBuilder()
          .setColor(process.env.ERROR_COLOR)
          .setDescription(t('queue_empty', language));
        return message.channel.send({ embeds: [embed] });
      }

      const itemsPerPage = 10;
      let currentPage = 0;

      const generateEmbed = (page) => {
        const start = page * itemsPerPage;
        const end = start + itemsPerPage;
        const currentQueue = queue.slice(start, end);

        const queueMessage = currentQueue.map((track, index) => `${start + index + 1}. **${track.title}** by **${track.author}**`).join('\n');
        return new EmbedBuilder()
          .setColor(process.env.DEFAULT_COLOR)
          .setDescription(t('queue_display', language, { queue: queueMessage }))
          .setFooter({
            text: t('global_page_footer', language, {
              currentPage: page + 1,
              totalPages: Math.ceil(queue.length / itemsPerPage),
              start: start + 1,
              end: Math.min(end, queue.length),
              totalEntries: queue.length
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
            .setDisabled(currentPage === Math.ceil(queue.length / itemsPerPage) - 1)
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
              .setDisabled(currentPage === Math.ceil(queue.length / itemsPerPage) - 1)
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
      return message.channel.send({ embeds: [embed] });
    }
  }
};