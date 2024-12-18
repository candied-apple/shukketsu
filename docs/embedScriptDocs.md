### Embed Scripting System Documentation

#### Overview
The embed scripting system allows you to create dynamic embeds and messages using a simple scripting syntax. Each parameter in the embed is represented by a key-value pair, separated by a colon. Multiple parameters are separated by `$v`.

#### Structure
- `{` begins a parameter.
- `:` separates the parameter key from its value.
- `$v` separates different parameters.
- `}` ends a parameter.

#### Parameters
- `url` - The embed URL. (e.g., `https://example.com`)
- `color` - The embed color. (e.g., `#FFFFFF`)
- `title` - The embed title. (e.g., `Hello {user}`)
- `description` - The embed description. (e.g., `Welcome {user}`)
- `image` - The embed image URL. (e.g., `https://example.com/image.png`)
- `thumbnail` - The embed thumbnail URL. (e.g., `https://example.com/thumbnail.png`)
- `timestamp` - The embed timestamp. (No arguments)
- `author` - The author information. (e.g., `{author: Name && IconURL && URL}`)
- `field` - A field in the embed. (e.g., `{field: FieldName && value: FieldValue && inline}`)
- `footer` - The footer information. (e.g., `{footer: FooterText && FooterIcon}`)
- `message` - The message content. (e.g., `{message: Welcome to {guild.name}, {user.mention}}`)

#### Limits
- **Embed Titles:** Limited to 256 characters.
- **Embed Descriptions:** Limited to 4096 characters.
- **Fields:** Up to 25 fields per embed.
- **Field Name:** Limited to 256 characters.
- **Field Value:** Limited to 1024 characters.
- **Footer Text:** Limited to 2048 characters.
- **Author Name:** Limited to 256 characters.
- **Total Embed Characters:** The sum of all characters from all embed structures must not exceed 6000 characters.
- **Normal Messages:** Limited to 2000 characters.

#### Example Script
```plaintext
{embed}$v{timestamp}$v{author: candiedapple && https://cdn.discordapp.com/avatars/292701645391921152/a_4fa2ba45f98e7febeff76173ce1a4169.gif?size=4096}$v{title: Welcome}$v{description: Welcome to the server!}$v{field: Field1 && value: Field1Value && inline}$v{field: Field2 && value: Field2Value && inline}$v{field: Field3 && value: Field3Value}$v{color: #d8e205}$v{footer: FooterText && FooterIconURL}$v{message: Welcome to {guild.name}, {user.mention}}
```

#### Dynamic Variables
You can use dynamic variables in your embeds to display user-specific information. For example, `{user}` will be replaced with the user’s display name.

#### Frequently Asked Questions

**How can I add a new line to my description parameter?**
- You can press `SHIFT + ENTER` to create a new line in your description parameter.

**Why isn’t my embed code working for some commands?**
- Some commands allow both raw text and embed code. To specify that you're entering an embed, begin your embed code with `{embed}$v`.

#### Example Usage in Code
```javascript
const { parseEmbedScript } = require('./embedScriptHandler');

const script = '{embed}$v{message: Welcome to {guild.name}, {user.mention}}$v{description: Welcome}';
const data = {
    guild: { name: 'Example Guild' },
    user: { mention: '@User' }
};

const { embed, messageContent } = parseEmbedScript(script, data);
channel.send({ content: messageContent, embeds: [embed] });
```

This documentation provides an overview of the embed scripting system, including the structure, parameters, dynamic variables, and example usage.
