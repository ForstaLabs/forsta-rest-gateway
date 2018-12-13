#!/usr/bin/env node

const api = require('./api');
const express = require('@feathersjs/express');
const feathers = require('@feathersjs/feathers');
const morgan = require('morgan');
const process = require('process');
const relay = require('librelay');
const expressWs = require('express-ws');

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
    await relay.storage.initialize();
    const app = express(feathers());
    app.use(morgan('dev'));  // logging
    app.use(express.json());
    const ws = expressWs(app);
    app.configure(express.rest());
    app.use('/messages/outgoing/v1', new api.messages.OutgoingV1());
    const incomingMessagesV1 = new api.messages.IncomingV1();
    app.ws('/messages/incoming/v1', async (ws, req, next) => {
        try {
            await incomingMessagesV1.onConnection(ws, req);
        } catch(e) {
            console.error("WebSocket Error:", e);
            next(e);
        }
    });
    app.use('/auth/v1', new api.auth.AuthV1());
    app.use('/account/v1', new api.account.AccountV1());
    app.use('/devices/v1', new api.devices.DevicesV1());
    app.use('/devices/registering/v1', new api.devices.DevicesRegisteringV1());
    app.use('/storage/state/v1', new api.storage.StateV1());
    app.use('/tags/v1', new api.tags.TagsV1());
    app.use(express.errorHandler());
    app.listen(port, listenAddr);
}


main();
