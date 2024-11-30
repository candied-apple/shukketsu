const fs = require('fs');
const path = require('path');
const { EmbedBuilder, REST, Routes } = require('discord.js');

// Define token and clientId
const token = process.env.TOKEN; // or replace with your actual token
const clientId = process.env.CLIENT_ID; // or replace with your actual client ID

async function loadSlashCommands(client) {
    const commands = [];

    function readSlashCommands(dir) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                readSlashCommands(fullPath);
            } else if (file.endsWith('.js')) {
                const slashCommand = require(fullPath);
                client.slashCommands.set(slashCommand.data.name, slashCommand);
                commands.push(slashCommand.data.toJSON());
            }
        }
    }

    readSlashCommands(path.join(__dirname, '../slashCommands'));

    const rest = new REST({ version: '10' }).setToken(token);

    try {
        await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );

        console.log(`Loaded ${commands.length} slash command`);
    } catch (error) {
        console.error(error);
    }

    client.on('interactionCreate', async interaction => {
        if (!interaction.isCommand()) return;

        const command = client.slashCommands.get(interaction.commandName);

        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);

            const errorEmbed = new EmbedBuilder()
                .setColor('#ff6464')
                .setDescription('<:deny:1276289955920085122> There was an error while executing this command!')

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    });
}

module.exports = { loadSlashCommands };