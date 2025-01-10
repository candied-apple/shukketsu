const dbWhitelist = require('../../models/dbWhitelist');
const { getLanguage, t } = require('../../handlers/languageHandler');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'whitelist add',
  description: 'Add a server to the whitelist',
  category: 'owner',
  syntax: "whitelist add <userId> <serverId>",
  example: "whitelist add 123456789012345678 123456789012345678",
  parameters: ["userId", "serverId"],
  flags: [],
  permissions: ["Administrator"],
  async execute(message, args) {
    const userId = args[0];
    const serverId = args[1];

    const language = await getLanguage(message.guild.id);

    if (!userId || !serverId) {
      const embed = new EmbedBuilder()
        .setColor('RED')
        .setDescription(t('provide_both_userId_serverId', language));
      return message.channel.send({ embeds: [embed] });
    }

    const newWhitelistEntry = new dbWhitelist({
      serverId: serverId,
      userId: userId
    });

    try {
      await newWhitelistEntry.save();
      const embed = new EmbedBuilder()
        .setColor('GREEN')
        .setDescription(t('server_added_to_whitelist', language, { serverId, userId }));
      message.channel.send({ embeds: [embed] });
    } catch (err) {
      if (err.code === 11000) {
        const embed = new EmbedBuilder()
          .setColor('YELLOW')
          .setDescription(t('server_already_whitelisted', language));
        message.channel.send({ embeds: [embed] });
      } else {
        console.error(err);
        const embed = new EmbedBuilder()
          .setColor('RED')
          .setDescription(t('global_error_description', language));
        message.channel.send({ embeds: [embed] });
      }
    }
  }
};