const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:8086/messages/incoming/v1');
ws.on('open', () => {
    console.log("Connected")
    ws.on('message', raw => {
        const event = JSON.parse(raw);
        console.log("Event:", raw);
    });
});
