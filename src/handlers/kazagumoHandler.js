const { Kazagumo, Plugins } = require('kazagumo');
const KazagumoFilter = require('kazagumo-filter');
const { Connectors } = require('shoukaku');
const { Client, EmbedBuilder } = require('discord.js');
const { getLanguage, t } = require('../handlers/languageHandler');
const fetch = require('node-fetch');

const Nodes = [{
  name: 'local',
  url: 'lava.inzeworld.com:3128',
  auth: 'saher.inzeworld.com',
  secure: false
}];

function setVoiceStatus(channelId, status) {
  return new Promise(async (resolve, reject) => {
    await fetch(`https://discord.com/api/v9/channels/${channelId}/voice-status`, {
      "headers": {
        "accept": "*/*",
        "authorization": `Bot token`,
        "content-type": "application/json"
      },
      "body": JSON.stringify({ "status": status }),
      "method": "PUT"
    })
      .then(e => e.text())
      .then(e => resolve(e))
      .catch(e => reject(e))
  })
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
    const language = await getLanguage(player.guildId);
    const embed = new EmbedBuilder()
      .setDescription(t('player_start', language, { title: track.title, author: track.author }))
      .setColor(process.env.DEFAULT_COLOR);

    client.channels.cache.get(player.textId)?.send({ embeds: [embed] })
      .then(x => player.data.set('message', x));

    // Set voice channel status to the current music
    await setVoiceStatus(player.voiceId, `Playing: ${track.title}`);
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