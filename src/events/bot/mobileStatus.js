module.exports = {
    name: 'ready',
    once: false,
    async execute(client) {
        const WebSocket = require('ws');

        const DISCORD_GATEWAY_URL = 'wss://gateway.discord.gg/?v=10&encoding=json';
        const TOKEN = process.env.TOKEN;
        const RECONNECT_DELAY = 5000; // 5 seconds

        function connect() {
            const ws = new WebSocket(DISCORD_GATEWAY_URL);

            ws.on('open', () => {
                //console.log('Connected to Discord Gateway');
            });

            ws.on('message', (data) => {
                const payload = JSON.parse(data);
                const { op, d } = payload;

                if (op === 10) { // Hello event
                    const { heartbeat_interval } = d;
                    heartbeat(heartbeat_interval);
                    identify();
                } else if (op === 11) { // Heartbeat ACK
                    //console.log('Received Heartbeat ACK');
                }
            });

            function heartbeat(interval) {
                setInterval(() => {
                    ws.send(JSON.stringify({ op: 1, d: null }));
                    //console.log('Heartbeat sent');
                }, interval);
            }

            function identify() {
                const identifyPayload = {
                    op: 2,
                    d: {
                        token: TOKEN,
                        intents: 513,
                        properties: {
                            $os: 'ios',
                            $browser: 'Discord iOS'
                        }
                    }
                };
                ws.send(JSON.stringify(identifyPayload));
                //console.log('Identification sent');
            }

            ws.on('close', () => {
                //console.log('WSS: Mobile Status Gateway Closed. Reconnecting');
                setTimeout(connect, RECONNECT_DELAY);
            });
        }

        connect();
    },
};