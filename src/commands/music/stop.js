const { EmbedBuilder } = require('discord.js');
const { getLanguage, t } = require('../../handlers/languageHandler');

module.exports = {
  name: 'stop',
  description: 'Stop the current music and clear the queue',
  category: 'music',
  syntax: 'stop',
  example: 'stop',
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
          .setDescription(t('stop_no_player', language));
        return message.channel.send({ embeds: [embed] });
      }

      const playerDataMessage = player.data.get('message');
      if (playerDataMessage) {
        await playerDataMessage.delete();
      }

      await player.destroy();
      await message.react('<:approve:1276238417427959818>');
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