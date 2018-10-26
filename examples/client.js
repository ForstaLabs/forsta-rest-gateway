const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8086/messages/incoming/v1');
ws.on('open', () => {
    console.log("Connected")
    ws.on('message', (a, b, c) => {console.log("foo!", a, b, c);});
});
ws.on('message', data => console.log("Message", data));
