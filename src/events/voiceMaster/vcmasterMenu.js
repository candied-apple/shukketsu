const { PermissionsBitField, ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, UserSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const ChannelSettings = require('../../models/dbServerData'); // Updated to use dbServerData
const MemberStats = require('../../models/dbMemberData'); // Updated to use dbMemberData
const { getLanguage, t } = require('../../handlers/languageHandler'); // Import language handler

const validCustomIds = new Set([
    'lock', 'unlock', 'ghost', 'reveal', 'limit', 'rename', 'permit', 'reject', 'transfer', 'delete',
    'permit_select', 'reject_select', 'transfer_select', 'limit_modal', 'rename_modal'
]);

// Cache to store rename attempts
const renameCache = new Map();

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        client.on('interactionCreate', async interaction => {
            if (!interaction.isButton() && !interaction.isUserSelectMenu() && !interaction.isModalSubmit()) return;

            const { customId, member, guild, channel } = interaction;

            if (!validCustomIds.has(customId)) {
                return;
            }

            try {
                const settings = await ChannelSettings.findOne({ serverId: guild.id });

                if (!settings) {
                    const language = await getLanguage(guild.id);
                    const embed = new EmbedBuilder()
                        .setDescription(t('voicemasterMenu_no_voice_master_settings', language))
                        .setColor(process.env.WARNING_COLOR);
                    return interaction.reply({ embeds: [embed], ephemeral: true });
                }

                const memberData = await MemberStats.findOne({ serverId: guild.id, memberId: member.id });

                if (!memberData || !memberData.voicemasterownedchannelid) {
                    const language = await getLanguage(guild.id);
                    const embed = new EmbedBuilder()
                        .setDescription(t('voicemasterMenu_no_voice_master_owned_channel', language))
                        .setColor(process.env.WARNING_COLOR);
                    return interaction.reply({ embeds: [embed], ephemeral: true });
                }

                const voiceChannel = guild.channels.cache.get(memberData.voicemasterownedchannelid);

                if (!voiceChannel) {
                    const language = await getLanguage(guild.id);
                    const embed = new EmbedBuilder()
                        .setDescription(t('voicemasterMenu_voice_master_owned_channel_not_found', language))
                        .setColor(process.env.WARNING_COLOR);
                    return interaction.reply({ embeds: [embed], ephemeral: true });
                }

                const language = await getLanguage(guild.id);

                if (interaction.isButton()) {
                    switch (customId) {
                        case 'lock':
                            await voiceChannel.permissionOverwrites.edit(guild.id, { Connect: false });
                            const lockEmbed = new EmbedBuilder()
                                .setDescription(t('voicemasterMenu_voice_channel_locked', language))
                                .setColor(process.env.SUCCESS_COLOR);
                            await interaction.reply({ embeds: [lockEmbed], ephemeral: true });
                            break;
                        case 'unlock':
                            await voiceChannel.permissionOverwrites.edit(guild.id, { Connect: null });
                            const unlockEmbed = new EmbedBuilder()
                                .setDescription(t('voicemasterMenu_voice_channel_unlocked', language))
                                .setColor(process.env.SUCCESS_COLOR);
                            await interaction.reply({ embeds: [unlockEmbed], ephemeral: true });
                            break;
                        case 'ghost':
                            await voiceChannel.permissionOverwrites.edit(guild.id, { ViewChannel: false });
                            const ghostEmbed = new EmbedBuilder()
                                .setDescription(t('voicemasterMenu_voice_channel_hidden', language))
                                .setColor(process.env.SUCCESS_COLOR);
                            await interaction.reply({ embeds: [ghostEmbed], ephemeral: true });
                            break;
                        case 'reveal':
                            await voiceChannel.permissionOverwrites.edit(guild.id, { ViewChannel: true });
                            const revealEmbed = new EmbedBuilder()
                                .setDescription(t('voicemasterMenu_voice_channel_revealed', language))
                                .setColor(process.env.SUCCESS_COLOR);
                            await interaction.reply({ embeds: [revealEmbed], ephemeral: true });
                            break;
                        case 'limit':
                            const limitModal = new ModalBuilder()
                                .setCustomId('limit_modal')
                                .setTitle(t('voicemasterMenu_set_user_limit', language));

                            const limitInput = new TextInputBuilder()
                                .setCustomId('limit_input')
                                .setLabel(t('voicemasterMenu_enter_user_limit', language))
                                .setPlaceholder(t('voicemasterMenu_unlimited_placeholder', language))
                                .setStyle(TextInputStyle.Short)
                                .setRequired(true);

                            const limitModalRow = new ActionRowBuilder().addComponents(limitInput);
                            limitModal.addComponents(limitModalRow);

                            await interaction.showModal(limitModal);
                            break;
                        case 'rename':
                            const renameModal = new ModalBuilder()
                                .setCustomId('rename_modal')
                                .setTitle(t('voicemasterMenu_rename_channel', language));

                            const nameInput = new TextInputBuilder()
                                .setCustomId('name_input')
                                .setLabel(t('voicemasterMenu_enter_new_channel_name', language))
                                .setStyle(TextInputStyle.Short)
                                .setRequired(true);

                            const renameModalRow = new ActionRowBuilder().addComponents(nameInput);
                            renameModal.addComponents(renameModalRow);

                            await interaction.showModal(renameModal);
                            break;
                        case 'permit':
                        case 'reject':
                        case 'transfer':
                            const userSelectMenu = new UserSelectMenuBuilder()
                                .setCustomId(`${customId}_select`)
                                .setPlaceholder(t('voicemasterMenu_select_user', language));

                            const row = new ActionRowBuilder().addComponents(userSelectMenu);

                            await interaction.reply({ content: t('voicemasterMenu_select_user_prompt', language), components: [row], ephemeral: true });
                            break;
                        case 'delete':
                            await voiceChannel.delete();
                            const deleteEmbed = new EmbedBuilder()
                                .setDescription(t('voicemasterMenu_voice_channel_deleted', language))
                                .setColor(process.env.WARNING_COLOR);
                            await interaction.reply({ embeds: [deleteEmbed], ephemeral: true });
                            break;
                        default:
                            const unknownActionEmbed = new EmbedBuilder()
                                .setDescription(t('voicemasterMenu_unknown_action', language))
                                .setColor(process.env.WARNING_COLOR);
                            await interaction.reply({ embeds: [unknownActionEmbed], ephemeral: true });
                            break;
                    }
                } else if (interaction.isUserSelectMenu()) {
                    const selectedUserId = interaction.values[0];
                    const selectedUser = guild.members.cache.get(selectedUserId);

                    switch (customId) {
                        case 'permit_select':
                            await voiceChannel.permissionOverwrites.edit(selectedUser, { Connect: true });
                            const permitEmbed = new EmbedBuilder()
                                .setDescription(t('voicemasterMenu_user_permitted', language, { user: selectedUser.user.tag }))
                                .setColor(process.env.SUCCESS_COLOR);
                            await interaction.update({ embeds: [permitEmbed], components: [], ephemeral: true });
                            break;
                        case 'reject_select':
                            await voiceChannel.permissionOverwrites.edit(selectedUser, { Connect: false });
                            const rejectEmbed = new EmbedBuilder()
                                .setDescription(t('voicemasterMenu_user_rejected', language, { user: selectedUser.user.tag }))
                                .setColor(process.env.WARNING_COLOR);
                            await interaction.update({ embeds: [rejectEmbed], components: [], ephemeral: true });
                            break;
                        case 'transfer_select':
                            // Set the current user's voicemasterownedchannelid to null
                            await MemberStats.updateOne(
                                { serverId: guild.id, memberId: member.id },
                                { $set: { voicemasterownedchannelid: '' } }
                            );

                            // Transfer ownership to the selected user
                            await MemberStats.updateOne(
                                { serverId: guild.id, memberId: selectedUserId },
                                { $set: { voicemasterownedchannelid: voiceChannel.id } },
                                { upsert: true }
                            );

                            // Give the selected user ManageChannels permission
                            await voiceChannel.permissionOverwrites.edit(selectedUser, { ManageChannels: true });

                            const transferEmbed = new EmbedBuilder()
                                .setDescription(t('voicemasterMenu_channel_ownership_transferred', language, { user: selectedUser.user.tag }))
                                .setColor(process.env.SUCCESS_COLOR);
                            await interaction.update({ embeds: [transferEmbed], components: [], ephemeral: true });
                            break;
                        default:
                            const unknownSelectEmbed = new EmbedBuilder()
                                .setDescription(t('voicemasterMenu_unknown_action', language))
                                .setColor(process.env.WARNING_COLOR);
                            await interaction.update({ embeds: [unknownSelectEmbed], components: [], ephemeral: true });
                            break;
                    }
                } else if (interaction.isModalSubmit()) {
                    if (customId === 'limit_modal') {
                        const limit = parseInt(interaction.fields.getTextInputValue('limit_input'), 10);

                        if (isNaN(limit) || limit < 0 || limit > 99) {
                            const invalidLimitEmbed = new EmbedBuilder()
                                .setDescription(t('voicemasterMenu_invalid_user_limit', language))
                                .setColor(process.env.WARNING_COLOR);
                            return interaction.reply({ embeds: [invalidLimitEmbed], ephemeral: true });
                        }

                        await voiceChannel.setUserLimit(limit);
                        const limitSetEmbed = new EmbedBuilder()
                            .setDescription(t('voicemasterMenu_user_limit_set', language, { limit }))
                            .setColor(process.env.SUCCESS_COLOR);
                        await interaction.reply({ embeds: [limitSetEmbed], ephemeral: true });
                    } else if (customId === 'rename_modal') {
                        const now = Date.now();
                        const renameAttempts = renameCache.get(member.id) || [];

                        // Filter out attempts older than 10 minutes
                        const recentAttempts = renameAttempts.filter(timestamp => now - timestamp < 10 * 60 * 1000);

                        if (recentAttempts.length >= 2) {
                            const renameLimitEmbed = new EmbedBuilder()
                                .setDescription(t('voicemasterMenu_rename_limit_reached', language))
                                .setColor(process.env.WARNING_COLOR);
                            return interaction.reply({ embeds: [renameLimitEmbed], ephemeral: true });
                        }

                        const newName = interaction.fields.getTextInputValue('name_input');

                        await voiceChannel.setName(newName);
                        const renameSuccessEmbed = new EmbedBuilder()
                            .setDescription(t('voicemasterMenu_channel_renamed', language, { name: newName }))
                            .setColor(process.env.SUCCESS_COLOR);
                        await interaction.reply({ embeds: [renameSuccessEmbed], ephemeral: true });

                        // Update the cache
                        recentAttempts.push(now);
                        renameCache.set(member.id, recentAttempts);
                    }
                }
            } catch (error) {
                console.error(error);
                const language = await getLanguage(guild.id);
                const errorEmbed = new EmbedBuilder()
                    .setDescription(t('global_error_description', language))
                    .setColor(process.env.ERROR_COLOR);
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        });
    },
};