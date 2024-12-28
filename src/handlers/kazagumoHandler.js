const { Kazagumo, Plugins } = require('kazagumo');
const KazagumoFilter = require('kazagumo-filter');
const { Connectors } = require('shoukaku');
const { Client, EmbedBuilder } = require('discord.js');
const { getLanguage, t } = require('../handlers/languageHandler');
const axios = require('axios');
require('dotenv').config();

const Nodes = [{
  name: 'Koi Node V4',
  url: 'lavav4.prplmoe.me:1118',
  auth: 'prplmoe.me',
  secure: false
}];

function setVoiceStatus(channelId, status) {
  return axios.put(`https://discord.com/api/v9/channels/${channelId}/voice-status`, {
    status: status
  }, {
    headers: {
      'accept': '*/*',
      'authorization': `Bot ${process.env.TOKEN}`,
      'content-type': 'application/json'
    }
  })
  .then(response => response.data)
  .catch(error => {
    throw error;
  });
}

module.exports = (client) => {
  const kazagumo = new Kazagumo({
    defaultSearchEngine: 'youtube',
    send: (guildId, payload) => {
      const guild = client.guilds.cache.get(guildId);
      if (guild) guild.shard.send(payload);
    },
    plugins: [
      new Plugins.PlayerMoved(client),
      new KazagumoFilter(),
    ],
  }, new Connectors.DiscordJS(client), Nodes);

  kazagumo.shoukaku.on('ready', (name) => console.log(`Lavalink ${name}: Ready!`));
  kazagumo.shoukaku.on('error', (name, error) => console.error(`Lavalink ${name}: Error Caught,`, error));
  kazagumo.shoukaku.on('close', (name, code, reason) => console.warn(`Lavalink ${name}: Closed, Code ${code}, Reason ${reason || 'No reason'}`));
  //kazagumo.shoukaku.on('debug', (name, info) => console.debug(`Lavalink ${name}: Debug,`, info));
  kazagumo.shoukaku.on('disconnect', (name, count) => {
    const players = [...kazagumo.shoukaku.players.values()].filter(p => p.node.name === name);
    players.map(player => {
      kazagumo.destroyPlayer(player.guildId);
      player.destroy();
    });
    console.warn(`Lavalink ${name}: Disconnected`);
  });

  kazagumo.on('playerStart', async (player, track) => {
    await setVoiceStatus(player.voiceId, `<a:shukketsu:1305529972391153724> ${track.title}`);
    const language = await getLanguage(player.guildId);
    const embed = new EmbedBuilder()
      .setDescription(t('player_start', language, { title: track.title, author: track.author }))
      .setColor(process.env.DEFAULT_COLOR);

    client.channels.cache.get(player.textId)?.send({ embeds: [embed] })
      .then(x => player.data.set('message', x));
  });

  kazagumo.on('playerEnd', async (player) => {
    const language = await getLanguage(player.guildId);
    const embed = new EmbedBuilder()
      .setDescription(t('player_end', language))
      .setColor(process.env.DEFAULT_COLOR);

    player.data.get('message')?.edit({ embeds: [embed] });
  });

  kazagumo.on('playerEmpty', async (player) => {
    const language = await getLanguage(player.guildId);
    const embed = new EmbedBuilder()
      .setDescription(t('player_empty', language))
      .setColor(process.env.DEFAULT_COLOR);

    client.channels.cache.get(player.textId)?.send({ embeds: [embed] })
      .then(x => player.data.set('message', x));
    player.destroy();
  });

  client.kazagumo = kazagumo;
};