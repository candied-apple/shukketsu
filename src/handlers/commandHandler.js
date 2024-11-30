const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

function loadCommands(client) {
    function readCommands(dir) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                readCommands(fullPath);
            } else if (file.endsWith('.js')) {
                const command = require(fullPath);
                client.commands.set(command.name, command);
            }
        }
    }

    readCommands(path.join(__dirname, '../commands'));
    console.log(`Loaded ${client.commands.size} command`);

    client.on('messageCreate', message => {
        if (!message.content.startsWith('!') || message.author.bot) return;

        const args = message.content.slice(1).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        if (!client.commands.has(commandName)) return;

        const command = client.commands.get(commandName);

        // Check for permissions
        if (command.permission && !message.member.permissions.has(command.permission)) {
            const embed = new EmbedBuilder()
                .setColor("#faa81a")
                .setDescription(`<:warning:1276238448189116517> You do not have permission to use this command.\nRequired permission: ${command.permission}`);
            return message.channel.send({ embeds: [embed] });
        }

        try {
            command.execute(message, args);
        } catch (error) {
            console.error(error);
            const embed = new EmbedBuilder()
                .setColor("#ff6464")
                .setDescription('<:deny:1276289955920085122> There was an error trying to execute that command!');
            message.channel.send({ embeds: [embed] });
        }
    });
}

module.exports = { loadCommands };