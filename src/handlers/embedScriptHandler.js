const { EmbedBuilder } = require('discord.js');
const { replaceVariables } = require('./variableHandler');

function parseEmbedScript(script, data) {
    const embed = new EmbedBuilder();
    let messageContent = '';
    
    if (!script) {
        return { embed: null, messageContent: '' };
    }

    // Remove {embed} from the start if present
    const cleanScript = script.startsWith('{embed}') ? script.slice(7) : script;
    const parameters = cleanScript.split('$v');

    parameters.forEach(param => {
        if (!param) return;

        // Updated regex to handle multiline content
        const matches = param.match(/^\{(.+?):\s*([\s\S]+?)\}$/);
        if (!matches) return;

        const [, key, value] = matches;

        switch (key) {
            case 'url':
                const url = replaceVariables(value, data)?.trim();
                if (url && isValidUrl(url)) embed.setURL(url);
                break;
            case 'color':
                const color = replaceVariables(value, data)?.trim();
                if (color) embed.setColor(color);
                break;
            case 'title':
                const title = replaceVariables(value, data)?.trim();
                if (title) embed.setTitle(title);
                break;
            case 'description':
                const description = replaceVariables(value, data)?.trim();
                if (description) embed.setDescription(description);
                break;
            case 'image':
                const image = replaceVariables(value, data)?.trim();
                if (image && isValidUrl(image)) embed.setImage(image);
                break;
            case 'thumbnail':
                const thumbnail = replaceVariables(value, data)?.trim();
                if (thumbnail && isValidUrl(thumbnail)) embed.setThumbnail(thumbnail);
                break;
            case 'timestamp':
                embed.setTimestamp();
                break;
            case 'author':
                const [authorName, ...authorRest] = value.split('&&').map(s => s.trim());
                const authorIcon = authorRest[0];
                const authorUrl = authorRest[1];

                const resolvedAuthorIcon = authorIcon ? replaceVariables(authorIcon, data) : undefined;
                const resolvedAuthorUrl = authorUrl ? replaceVariables(authorUrl, data) : undefined;

                const authorData = {
                    name: replaceVariables(authorName, data),
                    iconURL: resolvedAuthorIcon && isValidUrl(resolvedAuthorIcon) ? resolvedAuthorIcon : undefined,
                    url: resolvedAuthorUrl && isValidUrl(resolvedAuthorUrl) ? resolvedAuthorUrl : undefined
                };

                if (authorData.name) embed.setAuthor(authorData);
                break;
            case 'field':
                const fieldParams = value.split('&&').map(s => s.trim());
                const fieldName = fieldParams[0];
                const fieldValue = fieldParams[1]?.replace(/^value:\s*/, '').trim();
                const isInline = !fieldParams.some(param => 
                    param.toLowerCase().includes('noninline')
                ) && fieldParams.some(param => 
                    param.toLowerCase().includes('inline')
                );

                if (fieldName && fieldValue) {
                    embed.addFields({
                        name: replaceVariables(fieldName, data),
                        value: replaceVariables(fieldValue, data),
                        inline: isInline
                    });
                }
                break;
            case 'footer':
                const [footerText, footerIcon] = value.split('&&').map(s => s.trim());
                const resolvedFooterIcon = footerIcon ? replaceVariables(footerIcon, data) : undefined;

                if (footerText) {
                    embed.setFooter({
                        text: replaceVariables(footerText, data),
                        iconURL: resolvedFooterIcon && isValidUrl(resolvedFooterIcon) ? resolvedFooterIcon : undefined
                    });
                }
                break;
            case 'message':
                const message = replaceVariables(value, data)?.trim();
                if (message) messageContent = message;
                break;
        }
    });

    // Check if embed has any content
    const hasEmbedContent = Object.keys(embed.data).length > 0;
    return {
        embed: hasEmbedContent ? embed : null,
        messageContent
    };
}

function isValidUrl(string) {
    if (!string) return false;
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

module.exports = { parseEmbedScript };