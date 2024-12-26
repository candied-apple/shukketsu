const fs = require('fs');
const path = require('path');

const commandsDir = path.join(__dirname, 'src', 'commands');
const outputFilePath = path.join(__dirname, 'commands.json');

function readCommands(dir) {
    const commands = [];
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            commands.push(...readCommands(fullPath));
        } else if (file.endsWith('.js')) {
            const command = require(fullPath);
            commands.push({
                name: command.name,
                description: command.description,
                category: command.category,
                syntax: command.syntax,
                example: command.example,
                parameters: command.parameters,
                paramOptional: command.paramOptional,
                flags: command.flags,
                permissions: command.permissions,
            });
        }
    }

    return commands;
}

function generateCommandsJson() {
    const commands = readCommands(commandsDir);
    fs.writeFileSync(outputFilePath, JSON.stringify(commands, null, 2));
    console.log(`Generated ${outputFilePath} with ${commands.length} commands.`);
}

generateCommandsJson();