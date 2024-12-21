const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const dbServerData = require('../../models/dbServerData');
const { getLanguage, t } = require('../../handlers/languageHandler');

module.exports = {
    name: 'voicemaster setup',
    description: 'Setup voicemaster',
    category: 'server',
    syntax: 'voicemaster setup',
    example: 'voicemaster setup',
    parameters: [],
    paramOptional: true,
    flags: [],
    permissions: ['ManageGuild'],
    async execute(message, args, client) {
        try {
            const guildId = message.guild.id;
            const language = await getLanguage(guildId);

            // Fetch existing data
            const existingData = await dbServerData.findOne({ serverId: guildId });

            // Delete old channels if they exist
            if (existingData) {
                const { voicemasterchannelid, voicemastercategoryid, voicemasterinterfaceid } = existingData;
                if (voicemasterchannelid) {
                    const oldVoiceChannel = await message.guild.channels.cache.get(voicemasterchannelid);
                    if (oldVoiceChannel) await oldVoiceChannel.delete();
                }
                if (voicemastercategoryid) {
                    const oldCategory = await message.guild.channels.cache.get(voicemastercategoryid);
                    if (oldCategory) await oldCategory.delete();
                }
                if (voicemasterinterfaceid) {
                    const oldInterface = await message.guild.channels.cache.get(voicemasterinterfaceid);
                    if (oldInterface) await oldInterface.delete();
                }
            }

            // Setup subcommand logic
            const voicemastercategory = await message.guild.channels.create({
                name: 'voicemaster',
                type: 4,
            });

            const voicemasterinterface = await message.guild.channels.create({
                name: 'interface',
                type: 0,
                parent: voicemastercategory.id,
                permissionOverwrites: [
                    {
                        id: message.guild.roles.everyone.id,
                        deny: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AddReactions],
                    },
                ],
            });

            const voiceChannel = await message.guild.channels.create({
                name: 'join to create',
                type: 2,
                parent: voicemastercategory.id,
            });

            const embed = new EmbedBuilder()
                .setTitle(`${client.user.username} Interface`)
                .setColor(process.env.DEFAULT_COLOR)
                .setDescription(t('voicemasterSetup_interface_description', language))
                .setFields([
                    {
                        name: t('voicemasterSetup_button_usage', language), value: t('voicemasterSetup_button_usage_description', language)
                    },
                ]);

            const row1 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('lock')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('<:lock:1277900826630684692>')
                        .setDisabled(false),
                    new ButtonBuilder()
                        .setCustomId('unlock')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('<:unlock:1277900901872570450>')
                        .setDisabled(false),
                    new ButtonBuilder()
                        .setCustomId('ghost')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('<:ghost:1277900984894619669>')
                        .setDisabled(false),
                    new ButtonBuilder()
                        .setCustomId('reveal')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('<:unghost:1277901016519544922>')
                        .setDisabled(false),
                    new ButtonBuilder()
                        .setCustomId('limit')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('<:user:1277901339602583563>')
                        .setDisabled(false)
                );

            const row2 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('permit')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('<:plus:1277901223605043231>')
                        .setDisabled(false),
                    new ButtonBuilder()
                        .setCustomId('reject')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('<:minus:1277901267427000400>')
                        .setDisabled(false),
                    new ButtonBuilder()
                        .setCustomId('rename')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('<:channel:1277901144537960539>')
                        .setDisabled(false),
                    new ButtonBuilder()
                        .setCustomId('transfer')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('<:crown:1277901365250887770>')
                        .setDisabled(false),
                    new ButtonBuilder()
                        .setCustomId('delete')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('<:trash:1277901390999720058>')
                        .setDisabled(false)
                );

            await voicemasterinterface.send({ embeds: [embed], components: [row1, row2] });

            await dbServerData.findOneAndUpdate(
                { serverId: guildId },
                {
                    voicemasterchannelid: voiceChannel.id,
                    voicemastercategoryid: voicemastercategory.id,
                    voicemasterinterfaceid: voicemasterinterface.id
                },
                { upsert: true }
            );

            const successEmbed = new EmbedBuilder()
                .setColor(process.env.SUCCESS_COLOR)
                .setDescription(t('voicemasterSetup_success', language, {
                    category: voicemastercategory.name,
                    interfaceid: voicemasterinterface.id,
                    channelid: voiceChannel.id
                }));

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