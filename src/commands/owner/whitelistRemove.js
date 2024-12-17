const dbWhitelist = require('../../models/dbWhitelist');
const { getLanguage, t } = require('../../handlers/languageHandler');

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
      return message.channel.send(t('provide_serverId', language));
    }

    try {
      const result = await dbWhitelist.findOneAndDelete({ serverId: serverId });
      if (result) {
        message.channel.send(t('server_removed_from_whitelist', language, { serverId }));
      } else {
        message.channel.send(t('server_not_found_in_whitelist', language));
      }
    } catch (err) {
      console.error(err);
      message.channel.send(t('global_error_description', language));
    }
  }
};