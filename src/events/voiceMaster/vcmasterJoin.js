const dbServerData = require('../../models/dbServerData'); 
const dbMemberData = require('../../models/dbMemberData'); 

module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState) {
        if (!newState.channelId) return; // Only proceed if a user joined a voice channel

        const guildId = newState.guild.id;
        const userId = newState.member.id;

        // Retrieve server settings
        const serverSettings = await dbServerData.findOne({ serverId: guildId });
        if (!serverSettings) return;

        const { voicemasterchannelid, voicemastercategoryid } = serverSettings;

        // Check if the joined voice channel is the voice master channel
        if (newState.channelId !== voicemasterchannelid) return;

        // Retrieve member's username
        const memberUsername = newState.member.user.username;

        try {
            // Create a new voice channel for the member
            const newChannel = await newState.guild.channels.create({
                name: `${memberUsername}'s channel`,
                type: 2, 
                parent: voicemastercategoryid,
            });

            // Move the member to the newly created voice channel
            await newState.member.voice.setChannel(newChannel);

            // Store the new voice channel ID in the membersettings table
            await dbMemberData.updateOne(
                { serverId: guildId, memberId: userId },
                { $set: { voicemasterownedchannelid: newChannel.id } },
                { upsert: true }
            );
        } catch (error) {
            console.error(`Error creating or moving to the new channel for user ${userId} in guild ${guildId}:`, error);
        }
    },
};