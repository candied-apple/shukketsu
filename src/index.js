const { Client, GatewayIntentBits, Collection } = require('discord.js');
require('dotenv').config();
const { loadCommands } = require('./handlers/commandHandler');
const { loadSlashCommands } = require('./handlers/slashCommandHandler');
const { loadEvents } = require('./handlers/eventHandler');
const { connectToDatabase } = require('./handlers/mongooseHandler');
const { loadLanguages } = require('./handlers/languageHandler');
const loadKazagumo = require('./handlers/kazagumoHandler');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildModeration,
    ] 
});
// Initialize Collections
client.commands = new Collection();
client.slashCommands = new Collection();

// Load commands,events and systems
connectToDatabase();
loadLanguages();
loadCommands(client);
loadSlashCommands(client);
loadEvents(client);
loadKazagumo(client);



client.login(process.env.TOKEN);