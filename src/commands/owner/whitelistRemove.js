const dbWhitelist = require('../../models/dbWhitelist');
const { getLanguage, t } = require('../../handlers/languageHandler');
const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'whitelist remove',
  description: 'Remove a server from the whitelist',
  category: 'owner',
  syntax: 'whitelist remove <serverId>',
  example: 'whitelist remove 123456789012345678',
  parameters: ['serverId'],
  flags: [],
  permissions: ['Administrator'],
  async execute(message, args) {
    const serverId = args[0];
    const language = await getLanguage(message.guild.id);

    if (!serverId) {
      const embed = new MessageEmbed()
        .setColor('RED')
        .setDescription(t('provide_serverId', language));
      return message.channel.send({ embeds: [embed] });
    }

    try {
      const result = await dbWhitelist.findOneAndDelete({ serverId: serverId });
      if (result) {
        const embed = new MessageEmbed()
          .setColor('GREEN')
          .setDescription(t('server_removed_from_whitelist', language, { serverId }));
        message.channel.send({ embeds: [embed] });
      } else {
        const embed = new MessageEmbed()
          .setColor('YELLOW')
          .setDescription(t('server_not_found_in_whitelist', language));
        message.channel.send({ embeds: [embed] });
      }
    } catch (err) {
      console.error(err);
      const embed = new MessageEmbed()
        .setColor('RED')
        .setDescription(t('global_error_description', language));
      message.channel.send({ embeds: [embed] });
    }
  }
};