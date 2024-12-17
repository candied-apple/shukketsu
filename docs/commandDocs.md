# Command Development Documentation

## Overview

This documentation provides guidelines for creating new commands for the Shukketsu Discord bot. It covers the command structure, embed colors, language system, error handling, and other important aspects. The bot uses Discord.js v14.

## Command Structure

Each command should be defined as a module and exported using `module.exports`. The command module should include the following properties:

- **name**: The name of the command.
- **description**: A brief description of what the command does.
- **category**: The category under which the command falls (e.g., `owner`, `server`).
- **syntax**: The syntax for using the command.
- **example**: An example of how to use the command.
- **parameters**: An array of parameters required by the command.
- **flags**: An array of flags that can be used with the command.
- **permissions**: An array of permissions required to use the command.
- **execute**: An asynchronous function that contains the command's logic.

### Example Command

```javascript
const { EmbedBuilder } = require('discord.js');
const { getLanguage, t } = require('../../handlers/languageHandler');

module.exports = {
    name: 'example',
    description: 'An example command.',
    category: 'misc',
    syntax: 'example <param>',
    example: 'example test',
    parameters: ['param'],
    flags: [],
    permissions: ['Administrator'],
    async execute(message, args) {
        try {
            const language = await getLanguage(message.guild.id);
            const embed = new EmbedBuilder()
                .setDescription(t('example_description', language, { param: args[0] }))
                .setColor(process.env.DEFAULT_COLOR);

            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            const language = await getLanguage(message.guild.id);
            const embed = new EmbedBuilder()
                .setColor(process.env.ERROR_COLOR)
                .setDescription(t('global_error_description', language));
            message.channel.send({ embeds: [embed] });
        }
    },
};
```

## Embed Colors

Use the following colors for embeds:

- **DEFAULT_COLOR**: General information and success messages.
- **SUCCESS_COLOR**: Success messages.
- **WARNING_COLOR**: Warning messages.
- **ERROR_COLOR**: Error messages.

These colors are defined in the `.env` file:

```env
DEFAULT_COLOR="#96a7fc"
SUCCESS_COLOR="#a4eb78"
WARNING_COLOR="#faa81a"
ERROR_COLOR="#ff6464"
```

## Language System

The language system allows for multiple languages to be supported. Use the `getLanguage` function to fetch the language setting for the server and the `t` function to get translated strings.

### Example Usage

```javascript
const { getLanguage, t } = require('../../handlers/languageHandler');

const language = await getLanguage(message.guild.id);
const translatedString = t('example_key', language, { variable: 'value' });
```

### Adding New Translations

Add new translations to the appropriate language file in the `languages` directory. Each file should be a JSON file containing key-value pairs for translations.

Example `en.json`:

```json
{
    "example_key": "This is an example translation with a variable: {{variable}}"
}
```

## Error Handling

Always use try-catch blocks to handle errors in the `execute` function. Log the error to the console and send an error message to the user using an embed with the `ERROR_COLOR`.

### Example Error Handling

```javascript
try {
    // Command logic
} catch (error) {
    console.error(error);
    const language = await getLanguage(message.guild.id);
    const embed = new EmbedBuilder()
        .setColor(process.env.ERROR_COLOR)
        .setDescription(t('global_error_description', language));
    message.channel.send({ embeds: [embed] });
}
```

## Global Error Messages

Define global error messages in the language files. Use the `global_error_description` key for a generic error message.

Example `en.json`:

```json
{
    "global_error_description": "<:deny:1276289955920085122> There was an error while executing the command. Please contact discord.gg/shukketsu"
}
```

## Embeds

Always use embeds for messages sent by the bot. This ensures a consistent and visually appealing format for all messages.

## Conclusion

Follow these guidelines to ensure consistency and maintainability when creating new commands for the Shukketsu Discord bot. Use the provided examples and templates to help you get started.
