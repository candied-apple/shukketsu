const { EmbedBuilder } = require('discord.js');
const { replaceVariables } = require('./variableHandler');

const MAX_TITLE_LENGTH = 256;
const MAX_DESCRIPTION_LENGTH = 4096;
const MAX_FIELDS = 25;
const MAX_FIELD_NAME_LENGTH = 256;
const MAX_FIELD_VALUE_LENGTH = 1024;
const MAX_FOOTER_TEXT_LENGTH = 2048;
const MAX_AUTHOR_NAME_LENGTH = 256;
const MAX_TOTAL_CHARACTERS = 6000;
const MAX_MESSAGE_LENGTH = 2000;

function parseEmbedScript(script, data) {
    const embed = new EmbedBuilder();
    let messageContent = '';
    let totalCharacters = 0;

    if (!script) {
        return { embed: null, messageContent: '' };
    }

    const cleanScript = script.startsWith('{embed}') ? script.slice(7) : script;
    const parameters = cleanScript.split('$v');

    parameters.forEach(param => {
        if (!param) return;

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
                let title = replaceVariables(value, data)?.trim();
                if (title) {
                    title = title.slice(0, MAX_TITLE_LENGTH);
                    totalCharacters += title.length;
                    embed.setTitle(title);
                }
                break;
            case 'description':
                let description = replaceVariables(value, data)?.trim();
                if (description) {
                    description = description.slice(0, MAX_DESCRIPTION_LENGTH);
                    totalCharacters += description.length;
                    embed.setDescription(description);
                }
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

                let authorData = {
                    name: replaceVariables(authorName, data)?.slice(0, MAX_AUTHOR_NAME_LENGTH),
                    iconURL: resolvedAuthorIcon && isValidUrl(resolvedAuthorIcon) ? resolvedAuthorIcon : undefined,
                    url: resolvedAuthorUrl && isValidUrl(resolvedAuthorUrl) ? resolvedAuthorUrl : undefined
                };

                if (authorData.name) {
                    totalCharacters += authorData.name.length;
                    embed.setAuthor(authorData);
                }
                break;
            case 'field':
                if (embed.data.fields && embed.data.fields.length >= MAX_FIELDS) break;

                const fieldParams = value.split('&&').map(s => s.trim());
                const fieldName = fieldParams[0]?.slice(0, MAX_FIELD_NAME_LENGTH);
                const fieldValue = fieldParams[1]?.replace(/^value:\s*/, '').trim().slice(0, MAX_FIELD_VALUE_LENGTH);
                const isInline = !fieldParams.some(param => 
                    param.toLowerCase().includes('noninline')
                ) && fieldParams.some(param => 
                    param.toLowerCase().includes('inline')
                );

                if (fieldName && fieldValue) {
                    totalCharacters += fieldName.length + fieldValue.length;
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
                    const truncatedFooterText = replaceVariables(footerText, data)?.slice(0, MAX_FOOTER_TEXT_LENGTH);
                    totalCharacters += truncatedFooterText.length;
                    embed.setFooter({
                        text: truncatedFooterText,
                        iconURL: resolvedFooterIcon && isValidUrl(resolvedFooterIcon) ? resolvedFooterIcon : undefined
                    });
                }
                break;
            case 'message':
                let message = replaceVariables(value, data)?.trim();
                if (message) {
                    message = message.slice(0, MAX_MESSAGE_LENGTH);
                    messageContent = message;
                }
                break;
        }
    });

    if (totalCharacters > MAX_TOTAL_CHARACTERS) {
        return { embed: null, messageContent: 'Embed content exceeds the maximum allowed character limit.' };
    }

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