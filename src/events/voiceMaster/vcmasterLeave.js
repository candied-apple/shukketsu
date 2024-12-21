const dbServerData = require('../../models/dbServerData'); 

module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState) {
        if (!oldState.channelId || oldState.channelId === newState.channelId) return; // Only proceed if a user moved to another voice channel

        const guildId = oldState.guild.id;
        const leftVoiceChannelId = oldState.channelId;

        // Step 1: Get Server Data
        const serverData = await dbServerData.findOne({ serverId: guildId }).exec();
        const voicemastercategoryid = serverData?.voicemastercategoryid || '0';
        const voicemasterchannelid = serverData?.voicemasterchannelid || '0';

        // Step 2: Check if leftVoiceChannelId equals voicemasterchannelid
        if (leftVoiceChannelId === voicemasterchannelid) return;

        // Step 3: Get Voice Channel Info (parent category)
        const leftVoiceChannel = oldState.guild.channels.cache.get(leftVoiceChannelId);
        const leftVoiceChannelCategory = leftVoiceChannel?.parentId || null;

        // Step 4: Check if leftVoiceChannelCategory is null
        if (leftVoiceChannelCategory === null) return;

        // Step 5: Get Category Info (category ID)
        const leftVoiceChannelCategoryId = leftVoiceChannelCategory;

        // Step 6: Check if category ID matches voicemastercategoryid
        if (leftVoiceChannelCategoryId !== voicemastercategoryid) return;

        // Step 7: Get list of members connected to the left voice channel
        const connectedMembersList = leftVoiceChannel.members;

        // Step 8: Check if the number of connected members is less than 1
        const connectedMembersCount = connectedMembersList.size;
        if (connectedMembersCount >= 1) return;

        // Step 9: Delete the left voice channel if no members are connected
        await leftVoiceChannel.delete();
    },
};