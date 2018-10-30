const io = require('socket.io-client');

const socket = io.connect('http://localhost:8086/messages/incoming/v1');
socket.on('connect', (a, b, c) => {
    debugger;
    console.log("connect", a, b, c);
});
socket.on('event', (a, b, c) => {
    debugger;
    console.log("eVent", a, b, c);
});
socket.on('disconnect', (a, b, c) => {
    debugger;
    console.log("dIsconnect", a, b, c);
});

//const ws = new WebSocket('ws://localhost:8086/messages/incoming/v1');
//ws.on('open', () => {
//    console.log("Connected")
//    ws.on('message', (a, b, c) => {console.log("foo!", a, b, c);});
//});
//ws.on('message', data => console.log("Message", data));
