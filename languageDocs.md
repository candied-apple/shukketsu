
# Language System Documentation

## Overview

The language system allows you to manage multiple languages for your bot. It supports loading language files, fetching the language setting for each server from the database, and interpolating variables in translation strings.


## Language Files

Create language files in the `src/languages/` directory. Each file should be a JSON file containing key-value pairs for translations.

Example `src/languages/en.json`:
```json
{
    "greeting": "Hello!",
    "farewell": "Goodbye!",
    "rest_ping": "Rest ping is {{ping}}ms"
}
```

## Language Handler

The `languageHandler.js` file is responsible for loading languages, fetching the language setting for each server, and providing a function to get translated strings.

### Functions

- `loadLanguages()`: Loads all language files from the 
languages
directory.
- `getLanguage(serverId)`: Fetches the language setting for the specified server from the database.
- `t(key, language, variables = {})`: Returns the translated string for the given key and language, with optional variable interpolation.

## Usage

### Loading Languages

In your 
index.js, load the languages when initializing the bot:

```js
const { loadLanguages } = require('./handlers/languageHandler');
loadLanguages();
```

### Fetching and Using Translations

In your command files, use the `getLanguage` and `t` functions to fetch the language setting and get translated strings.

Example 
ping.js:
```js
const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { getLanguage, t } = require('../handlers/languageHandler');

module.exports = {
    name: 'ping',
    description: 'Replies with Pong along with the REST ping!',
    permission: 'Administrator',
    async execute(message, args) {
        const restPingStart = Date.now();
        await axios.get('https://discord.com/api/v10/gateway');
        const restPing = Date.now() - restPingStart;

        const language = await getLanguage(message.guild.id);
        const embed = new EmbedBuilder()
            .setTitle(t('greeting', language))
            .setDescription(t('rest_ping', language, { ping: restPing }))
            .setColor(process.env.DEFAULT_COLOR);

        message.channel.send({ 
            embeds: [embed]
        });
    },
};
```

This setup allows you to manage multiple languages for your bot and handle different sentence structures with variable interpolation.
