## Variable System Documentation

### Overview

The variable system allows you to use placeholders in your messages that will be dynamically replaced with actual values when the message is sent. This system supports variables related to guilds, users, channels, and dates/times.

### Usage

To use the variable system, include placeholders in your message string. When the message is processed, these placeholders will be replaced with the corresponding values.

### Placeholders

#### Guild Variables

| Variable                     | Output                                      |
|------------------------------|---------------------------------------------|
| `{guild.name}`               | The guild’s name                            |
| `{guild.id}`                 | The guild’s ID                              |
| `{guild.count}`              | The guild’s member count                    |
| `{guild.region}`             | The guild’s voice region                    |
| `{guild.shard}`              | The guild’s shard ID on bot                 |
| `{guild.owner_id}`           | The guild’s owner ID                        |
| `{guild.created_at}`         | The guild’s creation date in UTC            |
| `{guild.created_at_timestamp}` | The guild’s creation date in UNIX          |
| `{guild.emoji_count}`        | The guild’s emoji count                     |
| `{guild.role_count}`         | The guild’s role count                      |
| `{guild.boost_count}`        | The guild’s boost count                     |
| `{guild.boost_tier}`         | The guild’s boost tier, defaults to No Level if none |
| `{guild.preferred_locale}`   | The guild’s preferred locale                |
| `{guild.key_features}`       | The guild’s list of features (possibly N/A) |
| `{guild.icon}`               | The guild’s icon URL as a PNG (possibly N/A)|
| `{guild.banner}`             | The guild’s banner URL as a PNG (possibly N/A)|
| `{guild.splash}`             | The guild’s splash URL as a PNG (possibly N/A)|
| `{guild.discovery}`          | The guild’s discovery splash URL as a PNG (possibly N/A)|
| `{guild.max_presences}`      | The guild’s max presences amount            |
| `{guild.max_members}`        | The guild’s max members amount              |
| `{guild.max_video_channel_users}` | The guild’s max video channel users    |
| `{guild.afk_timeout}`        | The guild’s AFK timeout in seconds          |
| `{guild.afk_channel}`        | The guild’s AFK channel (possibly N/A)      |
| `{guild.channels}`           | The guild’s list of text, voice & category channels (possibly N/A)|
| `{guild.channels_count}`     | The guild’s total channel count             |
| `{guild.text_channels}`      | The guild’s list of text channels           |
| `{guild.text_channels_count}`| The guild’s text channel count              |
| `{guild.voice_channels}`     | The guild’s list of voice channels          |
| `{guild.voice_channels_count}`| The guild’s voice channel count            |
| `{guild.category_channels}`  | The guild’s list of category channels       |
| `{guild.category_channels_count}`| The guild’s category channel count      |

#### User Variables

| Variable                     | Output                                      |
|------------------------------|---------------------------------------------|
| `{user}`                     | The user’s name and discriminator           |
| `{user.id}`                  | The user’s ID                               |
| `{user.mention}`             | The user’s mention                          |
| `{user.name}`                | The user’s name                             |
| `{user.tag}`                 | The user’s discriminator                    |
| `{user.avatar}`              | The user’s profile picture                  |
| `{user.guild_avatar}`        | The user’s guild profile picture            |
| `{user.display_avatar}`      | The user’s available profile picture        |
| `{user.joined_at}`           | The user’s guild join date in UTC           |
| `{user.joined_at_timestamp}` | The user’s guild join date in UNIX          |
| `{user.created_at}`          | The user’s account creation date in UTC     |
| `{user.created_at_timestamp}`| The user’s account creation date in UNIX    |
| `{user.display_name}`        | The user’s current display name             |
| `{user.boost}`               | Yes/No if the user is boosting the guild    |
| `{user.boost_since}`         | The user’s initial guild boost date         |
| `{user.boost_since_timestamp}`| The user’s initial guild boost date in UNIX|
| `{user.color}`               | The user’s top role hex code                |
| `{user.top_role}`            | The user’s top role name, defaults to N/A   |
| `{user.role_list}`           | The user’s role list (possibly N/A)         |
| `{user.role_text_list}`      | The user’s role list in text (possibly N/A) |
| `{user.bot}`                 | Yes/No if the user is a bot                 |
| `{user.badges_icons}`        | The user’s profile badges with emotes (possibly N/A)|
| `{user.badges}`              | The user’s profile badges in text (possibly N/A)|
| `{user.join_position}`       | The user’s join position                    |
| `{user.join_position_suffix}`| The user’s join position with suffix        |

#### Channel Variables

| Variable                     | Output                                      |
|------------------------------|---------------------------------------------|
| `{channel.name}`             | The channel’s name                          |
| `{channel.id}`               | The channel’s ID                            |
| `{channel.mention}`          | The channel’s mention                       |
| `{channel.topic}`            | The channel’s topic                         |
| `{channel.type}`             | The channel’s type (text/news/..)           |
| `{channel.category_id}`      | The channel’s category ID (possibly N/A)    |
| `{channel.category_name}`    | The channel’s category name (possibly N/A)  |
| `{channel.position}`         | The channel’s position in the guild channel list|
| `{channel.slowmode_delay}`   | The channel’s slowmode delay in seconds (defaults to 0)|

#### Date/Time Variables

| Variable                     | Output                                      |
|------------------------------|---------------------------------------------|
| `{date.now}`                 | Current date in PST                         |
| `{date.utc_timestamp}`       | Current date as UNIX                        |
| `{date.now_proper}`          | Better formatted date in PST                |
| `{date.now_short}`           | Short formatted date in PST                 |
| `{date.now_shorter}`         | Shorter formatted date in PST               |
| `{time.now}`                 | 12 hour timestamp in PST                    |
| `{time.now_military}`        | 24 hour timestamp in PST                    |
| `{date.utc_now}`             | Current date in UTC                         |
| `{date.utc_now_proper}`      | Better formatted date in UTC                |
| `{date.utc_now_short}`       | Short formatted date in UTC                 |
| `{date.utc_now_shorter}`     | Shorter formatted date in UTC               |
| `{time.utc_now}`             | 12 hour timestamp in UTC                    |
| `{time.utc_now_military}`    | 24 hour timestamp in UTC                    |

### Example

Here is an example of how to use the variable system in a welcome message:

```javascript
const { replaceVariables } = require('../../handlers/variableHandler');

const data = {
    guild: member.guild,
    user: member.user,
    member: member,
    channel: channel
};

const welcomeMessage = replaceVariables("Welcome to {guild.name}, {user.name}!", data);
channel.send(welcomeMessage);
```

In this example, the placeholders `{guild.name}` and `{user.name}` will be replaced with the actual guild name and user name, respectively, when the message is sent.