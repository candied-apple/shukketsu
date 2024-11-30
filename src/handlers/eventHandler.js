const fs = require('fs');
const path = require('path');

function getAllEventFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(file => {
        if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
            arrayOfFiles = getAllEventFiles(path.join(dirPath, file), arrayOfFiles);
        } else if (file.endsWith('.js')) {
            arrayOfFiles.push(path.join(dirPath, file));
        }
    });

    return arrayOfFiles;
}

function loadEvents(client) {
    const eventFiles = getAllEventFiles(path.join(__dirname, '../events'));
    for (const file of eventFiles) {
        const event = require(file);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }
    }
    console.log(`Loaded ${eventFiles.length} events`);
}

module.exports = { loadEvents };