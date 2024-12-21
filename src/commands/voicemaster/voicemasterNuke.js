const { EmbedBuilder } = require('discord.js');
const dbServerData = require('../../models/dbServerData');
const { getLanguage, t } = require('../../handlers/languageHandler');

module.exports = {
    name: 'voicemaster nuke',
    description: 'Remove voicemaster channels from database and delete them in server',
    category: 'server',
    syntax: 'voicemaster nuke',
    example: 'voicemaster nuke',
    parameters: [],
    paramOptional: true,
    flags: [],
    permissions: ['ManageGuild'],
    async execute(message, args, client) {
        try {
            const guildId = message.guild.id;
            const language = await getLanguage(guildId);

            const serverData = await dbServerData.findOne({ serverId: guildId });
            if (!serverData) {
                const noDataEmbed = new EmbedBuilder()
                    .setColor(process.env.ERROR_COLOR)
                    .setDescription(t('voicemasterNuke_no_data', language));
                return message.channel.send({ embeds: [noDataEmbed] });
            }

            const { voicemasterchannelid, voicemastercategoryid, voicemasterinterfaceid } = serverData;

            const channelsToDelete = [
                voicemasterchannelid,
                voicemastercategoryid,
                voicemasterinterfaceid
            ];

            for (const channelId of channelsToDelete) {
                const channel = message.guild.channels.cache.get(channelId);
                if (channel) {
                    await channel.delete();
                }
            }

            await dbServerData.findOneAndUpdate(
                { serverId: guildId },
                {
                    $unset: {
                        voicemasterchannelid: "",
                        voicemastercategoryid: "",
                        voicemasterinterfaceid: ""
                    }
                }
            );

            const successEmbed = new EmbedBuilder()
                .setColor(process.env.SUCCESS_COLOR)
                .setDescription(t('voicemasterNuke_success', language));
            await message.channel.send({ embeds: [successEmbed] });
        } catch (error) {
            console.error(error);
            const language = await getLanguage(message.guild.id);
            const errorEmbed = new EmbedBuilder()
                .setColor(process.env.ERROR_COLOR)
                .setDescription(t('global_error_description', language));
            message.channel.send({ embeds: [errorEmbed] });
        }
    }
};