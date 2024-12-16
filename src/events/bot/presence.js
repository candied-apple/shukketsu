const { ActivityType } = require('discord.js');

module.exports = {
    name: 'ready',
    once: false,
    async execute(client) {
        const activities = [
            { name: "🔗 discord.gg/shukketsu", type: ActivityType.Custom },
            { name: "🔗 shukketsu.app", type: ActivityType.Custom }
        ];
        let currentActivity = 0;

        async function updatePresence() {
            try {
                await client.user.setPresence({
                    activities: [activities[currentActivity]],
                    status: 'online',
                });
                currentActivity = (currentActivity + 1) % activities.length;
            } catch (error) {
                console.error(error);
            }
        }

        updatePresence(); // Set initial presence
        setInterval(updatePresence, 60000); // Update presence every 60 seconds
    },
};