const { Kazagumo, Plugins } = require('kazagumo');
const KazagumoFilter = require('kazagumo-filter');
const { Connectors } = require('shoukaku');
const { Client, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getLanguage, t } = require('../handlers/languageHandler');
const axios = require('axios');
require('dotenv').config();

const Nodes = [{
  name: 'INZEWORLD.COM (DE)',
  url: 'lava.inzeworld.com:3128',
  auth: 'saher.inzeworld.com',
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

function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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
    const requester = track.requester;
    const remainingTime = formatDuration(track.length);

    const embed = new EmbedBuilder()
      .setDescription(`Now playing [\`${track.title}\`](${track.uri}) by **${track.author}**`)
      .setColor(process.env.DEFAULT_COLOR)
      .setFooter({
        text: `Queued by ${requester.username}・${remainingTime} remaining`,
        iconURL: requester.displayAvatarURL({ dynamic: true })
      });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('previous')
          .setEmoji('<:previous:1292859351999971338>')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('pause_resume')
          .setEmoji('<:pause:1292859373197987850>')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('skip')
          .setEmoji('<:next:1292859390113611806>')
          .setStyle(ButtonStyle.Secondary)
      );

    client.channels.cache.get(player.textId)?.send({ embeds: [embed], components: [row] })
      .then(x => player.data.set('message', x));
  });

  kazagumo.on('playerEnd', async (player) => {
    const message = player.data.get('message');
    if (message) {
      await message.delete();
    }
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

  client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    const player = client.kazagumo.players.get(interaction.guildId);
    if (!player) return;

    const message = player.data.get('message');
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('previous')
          .setEmoji('<:previous:1292859351999971338>')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('pause_resume')
          .setEmoji(player.paused ? '<:pause:1292859373197987850>' : '<:play:1292859407868362853>')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('skip')
          .setEmoji('<:next:1292859390113611806>')
          .setStyle(ButtonStyle.Secondary)
      );

    switch (interaction.customId) {
      case 'previous':
        await player.play(player.getPrevious(true));
        break;
      case 'pause_resume':
        player.pause(!player.paused);
        const remainingTime = formatDuration(player.queue.current.length - player.position);
        const embedData = interaction.message.embeds[0];
        const updatedEmbed = new EmbedBuilder(embedData)
          .setFooter({
            text: `Queued by ${player.queue.current.requester.username}・${remainingTime} remaining`,
            iconURL: player.queue.current.requester.displayAvatarURL({ dynamic: true })
          });
        await interaction.update({ embeds: [updatedEmbed], components: [row] });
        break;
      case 'skip':
        player.skip();
        break;
    }
  });

  client.kazagumo = kazagumo;
};