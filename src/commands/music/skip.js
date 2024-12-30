const { EmbedBuilder } = require('discord.js');
const { getLanguage, t } = require('../../handlers/languageHandler');

module.exports = {
  name: 'skip',
  description: 'Skip the current song',
  category: 'music',
  syntax: 'skip',
  example: 'skip',
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
          .setDescription(t('skip_no_player', language));
        return message.channel.send({ embeds: [embed] });
      }

      player.skip();
      await message.react('<:approve:1276238417427959818>');;
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