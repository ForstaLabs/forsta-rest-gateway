
const api = require('./api');
const express = require('@feathersjs/express');
const feathers = require('@feathersjs/feathers');
const morgan = require('morgan');
const process = require('process');
const socketio = require('@feathersjs/socketio');

const port = process.env.PORT || '8086';
const listenAddr = process.env.LISTEN_ADDR || '127.0.0.1';


let _rejectCount = 0;
process.on('unhandledRejection', ev => {
    console.error(ev);
    if (_rejectCount++ > 100) {
        console.error("Reject count too high, killing process.");
        process.exit(1);
    }
});


async function main() {
    const app = express(feathers());
    app.use(morgan('dev'));  // logging
    app.use(express.json());
    app.configure(express.rest());
    app.configure(socketio());
    app.use('/messages/outgoing/v1', new api.messages.OutgoingV1());
    app.use('/messages/incoming/v1', new api.messages.IncomingV1());
    app.use('/auth/v1', new api.auth.AuthV1());
    app.use('/account/v1', new api.account.AccountV1());
    app.use('/devices/v1', new api.devices.DevicesV1());
    app.use('/devices/registering/v1', new api.devices.DevicesRegisteringV1());
    app.use(express.errorHandler());
    app.listen(port, listenAddr);
}


main();
