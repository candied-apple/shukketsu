const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');
const { loadLanguages, getLanguage, t } = require('../handlers/languageHandler');
const dbServerData = require('../models/dbServerData');
const { hasFakePermission } = require('../handlers/fakePermissionsHandler');

const owners = process.env.OWNERS.split(',');

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

    client.on('messageCreate', async message => {
        if (!message.content.startsWith(process.env.PREFIX) || message.author.bot) return;

        const args = message.content.slice(process.env.PREFIX.length).trim().split(/ +/);
        let commandName = args.shift().toLowerCase();

        const serverData = await dbServerData.findOne({ serverId: message.guild.id });
        if (serverData) {
            // Check for multi-word aliases
            let aliasFound = false;
            for (let i = args.length; i >= 0; i--) {
                const potentialAlias = [commandName, ...args.slice(0, i)].join(' ');
                for (const [cmd, aliases] of serverData.aliases.entries()) {
                    if (aliases.includes(potentialAlias)) {
                        commandName = cmd;
                        args.splice(0, i);
                        aliasFound = true;
                        break;
                    }
                }
                if (aliasFound) break;
            }
            if (!aliasFound) {
                for (const [cmd, aliases] of serverData.aliases.entries()) {
                    if (aliases.includes(commandName)) {
                        commandName = cmd;
                        break;
                    }
                }
            }
        }

        // Check for multi-word commands
        const fullCommandName = [commandName];
        while (args.length && client.commands.has(fullCommandName.concat(args[0]).join(' '))) {
            fullCommandName.push(args.shift().toLowerCase());
        }

        const command = client.commands.get(fullCommandName.join(' '));
        if (!command) return;

        const language = await getLanguage(message.guild.id);

        // Check if the command is in the owner category
        if (command.category === 'owner' && !owners.includes(message.author.id)) {
            const embed = new EmbedBuilder()
                .setColor(process.env.ERROR_COLOR)
                .setDescription(t('handler_no_permission', language, { permission: 'Bot Owner' }));
            return message.channel.send({ embeds: [embed] });
        }

        // Check for fake permissions
        if (command.permissions && command.permissions.length > 0) {
            for (const permission of command.permissions) {
                if (!(await hasFakePermission(message.member, permission))) {
                    // Check for permissions
                    if (command.permissions && !message.member.permissions.has(command.permissions)) {
                        const embed = new EmbedBuilder()
                            .setColor("#faa81a")
                            .setDescription(t('handler_no_permission', language, { permission: command.permissions }));
                        return message.channel.send({ embeds: [embed] });
                    }
                }
            }
        }

        // Check for required parameters
        if (command.parameters && command.parameters.length > 0 && args.length < command.parameters.length) {
            const embed = new EmbedBuilder()
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setTitle(command.name)
                .setColor(process.env.DEFAULT_COLOR)
                .setDescription(command.description)
                .addFields(
                    { name: 'Permissions', value: command.permissions.join(', ') || t('no_parameters', language), inline: true },
                    { name: 'Usage', value: `\`\`\`Syntax: ${command.syntax}\`\`\` \`\`\`\nExample: ${command.example}\`\`\`` || t('no_syntax_example', language) },
                )
            return message.channel.send({ embeds: [embed] });
        }
        try {
            command.execute(message, args);
        } catch (error) {
            console.error(error);
            const embed = new EmbedBuilder()
                .setColor(process.env.ERROR_COLOR)
                .setDescription(t('global_error_description', language));
            message.channel.send({ embeds: [embed] });
        }
    });
}

module.exports = { loadCommands };