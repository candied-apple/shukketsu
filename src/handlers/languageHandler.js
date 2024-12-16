const fs = require('fs');
const path = require('path');
const dbServerData = require('../models/dbServerData');

let languages = {};
let defaultLanguage = 'en';

function loadLanguages() {
    const languageFiles = fs.readdirSync(path.join(__dirname, '../languages'));
    for (const file of languageFiles) {
        if (file.endsWith('.json')) {
            const language = require(path.join(__dirname, '../languages', file));
            const languageName = path.basename(file, '.json');
            languages[languageName] = language;
        }
    }
    console.log(`Loaded ${Object.keys(languages).length} languages`);
}

async function getLanguage(serverId) {
    try {
        const serverData = await dbServerData.findOne({ serverId });
        return serverData ? serverData.language : defaultLanguage;
    } catch (error) {
        console.error(`Error fetching language for server ${serverId}:`, error);
        return defaultLanguage;
    }
}

function t(key, language, variables = {}) {
    let translation = languages[language][key] || key;
    for (const [variable, value] of Object.entries(variables)) {
        translation = translation.replace(`{{${variable}}}`, value);
    }
    return translation;
}

module.exports = { loadLanguages, getLanguage, t };