# Pagination System Documentation

## Overview
The pagination system manages large datasets by breaking them into navigable pages, with proper empty state and edge case handling.

## Core Components

### 1. Page Calculation
```javascript
const calculatePages = (dataLength, itemsPerPage) => {
    return Math.max(1, Math.ceil(dataLength / itemsPerPage));
};
```

### 2. Embed Generation
```javascript
function generateEmbed(data, page, itemsPerPage, language) {
    // Handle empty data
    if (!data || data.length === 0) {
        return new EmbedBuilder()
            .setTitle('No Data')
            .setDescription('No items available.')
            .setColor(process.env.WARNING_COLOR);
    }

    const start = page * itemsPerPage;
    const end = Math.min(start + itemsPerPage, data.length);
    const currentItems = data.slice(start, end);
    const totalPages = calculatePages(data.length, itemsPerPage);

    const embed = new EmbedBuilder()
        .setTitle('Paginated Data')
        .setColor(process.env.DEFAULT_COLOR)
        .setFooter({
            text: t('global_page_footer', language, {
                currentPage: page + 1,
                totalPages,
                start: data.length ? start + 1 : 0,
                end,
                totalEntries: data.length
            })
        });

    currentItems.forEach(item => {
        embed.addFields({ name: item.name, value: item.value });
    });

    return embed;
}
```

### 3. Button Management
```javascript
function createButtons(currentPage, totalItems, itemsPerPage) {
    const totalPages = calculatePages(totalItems, itemsPerPage);
    
    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('previous')
                .setEmoji('<:left:1276955776442958015>')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(currentPage === 0 || totalItems === 0),
            new ButtonBuilder()
                .setCustomId('next')
                .setEmoji('<:right:1276955810806763571>')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(currentPage >= totalPages - 1 || totalItems === 0)
        );
}
```

### 4. Pagination Handler
```javascript
async function paginate(message, data, itemsPerPage, language) {
    let currentPage = 0;
    
    // Handle empty data
    if (!data || data.length === 0) {
        const embed = generateEmbed([], 0, itemsPerPage, language);
        return message.channel.send({ embeds: [embed] });
    }

    const embed = generateEmbed(data, currentPage, itemsPerPage, language);
    const buttons = createButtons(currentPage, data.length, itemsPerPage);

    const messageEmbed = await message.channel.send({ 
        embeds: [embed], 
        components: [buttons] 
    });

    const filter = i => i.user.id === message.author.id;
    const collector = messageEmbed.createMessageComponentCollector({ 
        filter, 
        time: 60000 
    });

    collector.on('collect', async interaction => {
        currentPage = interaction.customId === 'previous' ? 
            Math.max(0, currentPage - 1) : 
            Math.min(calculatePages(data.length, itemsPerPage) - 1, currentPage + 1);

        const newEmbed = generateEmbed(data, currentPage, itemsPerPage, language);
        const newButtons = createButtons(currentPage, data.length, itemsPerPage);

        await interaction.update({ 
            embeds: [newEmbed], 
            components: [newButtons] 
        });
    });

    collector.on('end', () => {
        const disabledButtons = createButtons(currentPage, data.length, itemsPerPage)
            .components.map(button => button.setDisabled(true));
        
        messageEmbed.edit({ 
            components: [new ActionRowBuilder().addComponents(disabledButtons)] 
        });
    });
}
```

## Edge Cases

1. **Empty Data**
- System displays "No items available" message
- Buttons are disabled
- Proper zero-state handling

2. **Single Page**
- Both navigation buttons disabled
- Footer shows correct count

3. **Error States**
```javascript
try {
    await paginate(message, data, itemsPerPage, language);
} catch (error) {
    console.error('Pagination error:', error);
    await message.channel.send({
        embeds: [
            new EmbedBuilder()
                .setDescription('An error occurred while paginating.')
                .setColor(process.env.ERROR_COLOR)
        ]
    });
}
```

## Best Practices

1. Always validate input data
2. Handle empty states gracefully
3. Include proper error handling
4. Disable buttons appropriately
5. Set reasonable timeouts
6. Clean up collectors

## Example Implementation
See the 'help.js' or 'alias.js' commands for complete implementation examples.
