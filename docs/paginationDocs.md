# Pagination System Documentation

## Overview

The pagination system allows you to display large sets of data in a user-friendly manner by breaking them into multiple pages. This is particularly useful for commands that list items, such as aliases or commands in a help menu.

## Components

The pagination system consists of the following components:

1. **Embed Generation**: A function to generate an embed for a specific page.
2. **Buttons**: Navigation buttons to move between pages.
3. **Collector**: A message component collector to handle button interactions.

## Example Implementation

### Embed Generation

Create a function to generate an embed for a specific page. This function should take the current page number and the data to be displayed as parameters.

```javascript
const { EmbedBuilder } = require('discord.js');

function generateEmbed(data, page, itemsPerPage, language) {
    const start = page * itemsPerPage;
    const end = start + itemsPerPage;
    const currentItems = data.slice(start, end);

    const embed = new EmbedBuilder()
        .setTitle('Paginated Data')
        .setColor(process.env.DEFAULT_COLOR)
        .setFooter({
            text: t('global_page_footer', language, {
                currentPage: page + 1,
                totalPages: Math.ceil(data.length / itemsPerPage),
                start: start + 1,
                end: Math.min(end, data.length),
                totalEntries: data.length
            })
        });

    currentItems.forEach(item => {
        embed.addFields({ name: item.name, value: item.value });
    });

    return embed;
}
```

### Buttons

Create navigation buttons to move between pages.

```javascript
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function createButtons(currentPage, totalPages) {
    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('previous')
                .setEmoji('<:left:1276955776442958015>')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(currentPage === 0),
            new ButtonBuilder()
                .setCustomId('next')
                .setEmoji('<:right:1276955810806763571>')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(currentPage === totalPages - 1)
        );
}
```

### Collector

Create a message component collector to handle button interactions and update the embed accordingly.

```javascript
async function paginate(message, data, itemsPerPage, language) {
    let currentPage = 0;
    const totalPages = Math.ceil(data.length / itemsPerPage);

    const embed = generateEmbed(data, currentPage, itemsPerPage, language);
    const buttons = createButtons(currentPage, totalPages);

    const messageEmbed = await message.channel.send({ embeds: [embed], components: [buttons] });

    const filter = interaction => ['previous', 'next'].includes(interaction.customId) && interaction.user.id === message.author.id;
    const collector = messageEmbed.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async interaction => {
        if (interaction.customId === 'previous') {
            currentPage--;
        } else if (interaction.customId === 'next') {
            currentPage++;
        }

        const newEmbed = generateEmbed(data, currentPage, itemsPerPage, language);
        const newButtons = createButtons(currentPage, totalPages);

        await interaction.update({ embeds: [newEmbed], components: [newButtons] });
    });

    collector.on('end', () => {
        const disabledRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('previous')
                    .setEmoji('<:left:1276955776442958015>')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setEmoji('<:right:1276955810806763571>')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true)
            );
        messageEmbed.edit({ components: [disabledRow] });
    });
}
```

### Example Command

Here is an example command that uses the pagination system to list aliases.

```javascript
const { getLanguage, t } = require('../../handlers/languageHandler');
const dbServerData = require('../../models/dbServerData');

module.exports = {
    name: 'alias list',
    description: 'List all aliases for all commands',
    category: 'server',
    syntax: 'alias list',
    example: 'alias list',
    parameters: [],
    flags: [],
    permissions: ['Administrator'],
    async execute(message) {
        const language = await getLanguage(message.guild.id);

        try {
            const serverData = await dbServerData.findOne({ serverId: message.guild.id });
            const aliases = serverData?.aliases || new Map();

            if (aliases.size === 0) {
                const noAliasesEmbed = new EmbedBuilder()
                    .setDescription(t('aliasList_no_aliases', language))
                    .setColor(process.env.WARNING_COLOR);
                return message.channel.send({ embeds: [noAliasesEmbed] });
            }

            const aliasesArray = Array.from(aliases.entries()).map(([commandName, commandAliases]) => ({
                name: commandName,
                value: commandAliases.join(', ')
            }));

            paginate(message, aliasesArray, 10, language);
        } catch (error) {
            console.error(error);
            const errorEmbed = new EmbedBuilder()
                .setDescription(t('global_error_description', language))
                .setColor(process.env.ERROR_COLOR);
            message.channel.send({ embeds: [errorEmbed] });
        }
    }
};
```

## Conclusion

The pagination system helps manage large sets of data by breaking them into multiple pages, making it easier for users to navigate and view the information. Use the provided examples and templates to implement pagination in your commands.
