const { EmbedBuilder } = require('discord.js');
const { getLanguage, t } = require('../../handlers/languageHandler');

module.exports = {
  name: 'previous',
  description: 'Play the previous song',
  category: 'music',
  syntax: 'previous',
  example: 'previous',
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
          .setDescription(t('previous_no_player', language));
        return message.channel.send({ embeds: [embed] });
      }

      const previous = player.getPrevious();
      if (!previous) {
        const embed = new EmbedBuilder()
          .setColor(process.env.ERROR_COLOR)
          .setDescription(t('previous_no_track', language));
        return message.channel.send({ embeds: [embed] });
      }

      await player.play(player.getPrevious(true));
      const embed = new EmbedBuilder()
        .setColor(process.env.DEFAULT_COLOR)
        .setDescription(t('previous_playing', language));
      return message.channel.send({ embeds: [embed] });
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