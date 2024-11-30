const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { LavalinkManager } = require('lavalink-client');
require('dotenv').config();
const { loadCommands } = require('./handlers/commandHandler');
const { loadSlashCommands } = require('./handlers/slashCommandHandler');
const { loadEvents } = require('./handlers/eventHandler');

const client = new Client({ 
    intents: [
        // Your existing intents
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.MessageContent
    ] 
});

// Initialize Collections
client.commands = new Collection();
client.slashCommands = new Collection();

// Initialize Lavalink
client.lavalink = new LavalinkManager({
    nodes: [
        {
            id: 'main',
            host: 'shukketsu.app', // Your Lavalink server host
            port: 2333, // Your Lavalink server port
            authorization: 'alpo123' // Your Lavalink password
        }
    ],
    sendToShard: (guildId, payload) => client.guilds.cache.get(guildId)?.shard?.send(payload),
    autoSkip: true,
    client: {
        id: process.env.CLIENT_ID,
        username: client.user?.username || 'Bot'
    }
});

// Handle raw events for Lavalink
client.on('raw', (d) => client.lavalink.sendRawData(d));

// Initialize Lavalink when bot is ready
client.on('ready', () => {
    client.lavalink.init(client.user);
});

// Load commands and events
loadCommands(client);
loadSlashCommands(client);
loadEvents(client);

// Handle Lavalink node connection
client.lavalink.on('create', (node) => {
    console.log(`Lavalink Node ${node.id} connected`);
});

// Handle Lavalink errors
client.lavalink.on('error', (node, error) => {
    console.error(`Lavalink Node ${node.id} encountered an error:`, error);
});

client.login(process.env.TOKEN);