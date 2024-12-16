const dbWhitelist = require('../../models/dbWhitelist');

module.exports = {
  name: 'whitelist remove',
  description: 'Remove a server from the whitelist',
  execute(message, args) {
    const serverId = args[0];

    if (!serverId) {
      return message.channel.send('Please provide the serverId.');
    }

    dbWhitelist.findOneAndDelete({ serverId: serverId })
      .then(result => {
        if (result) {
          message.channel.send(`Server ${serverId} removed from whitelist.`);
        } else {
          message.channel.send('This server was not found in the whitelist.');
        }
      })
      .catch(err => {
        console.error(err);
        message.channel.send('There was an error removing the server from the whitelist.');
      });
  }
};