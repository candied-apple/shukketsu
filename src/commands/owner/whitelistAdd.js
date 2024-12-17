const dbWhitelist = require('../../models/dbWhitelist');
const { getLanguage, t } = require('../../handlers/languageHandler');

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
      return message.channel.send(t('provide_both_userId_serverId', language));
    }

    const newWhitelistEntry = new dbWhitelist({
      serverId: serverId,
      userId: userId
    });

    try {
      await newWhitelistEntry.save();
      message.channel.send(t('server_added_to_whitelist', language, { serverId, userId }));
    } catch (err) {
      if (err.code === 11000) {
        message.channel.send(t('server_already_whitelisted', language));
      } else {
        console.error(err);
        message.channel.send(t('global_error_description', language));
      }
    }
  }
};