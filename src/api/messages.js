const relay = require('librelay');


class OutgoingV1 {
    async create(data, params) {
        const sender = await relay.MessageSender.factory();
        return await sender.send(data);
    }
}


class IncomingV1 {

    constructor(ws) {
        this.clients = new Set();
    }

    publish(event, data) {
        if (!this.clients.size) {
            console.warn(`Ignoring ${event} event.  No clients are connected.`);
            return;
        }
        const payload = JSON.stringify({event, data});
        console.info(`Publishing ${event} event to ${this.clients.size} client(s).`);
        for (const ws of this.clients) {
            ws.send(payload);
        }
    }

    async onConnection(ws, req) {
        this.clients.add(ws);
        if (!this.reciever) {
            this.reciever = await relay.MessageReceiver.factory();
            this.reciever.addEventListener('keychange', this.onKeyChange.bind(this));
            this.reciever.addEventListener('message', this.onMessage.bind(this));
            this.reciever.addEventListener('receipt', this.onReceipt.bind(this));
            this.reciever.addEventListener('sent', this.onSent.bind(this));
            this.reciever.addEventListener('read', this.onRead.bind(this));
            this.reciever.addEventListener('closingsession', this.onClosingSession.bind(this));
            this.reciever.addEventListener('error', this.onError.bind(this));
            await this.reciever.connect();
        }
        console.info("Client connected:", req.ip);
        ws.on('close', () => {
            console.warn("Client disconnected: ", req.ip);
            this.clients.delete(ws);
        });
    }

    async onKeyChange(ev) {
        // XXX TBD  Probably just autoaccept for now.
        debugger;
        console.error("`keychange` event not handled");
    }

    async onMessage(ev) {
        for (const x of ev.data.message.attachments) {
            x.data = await this.reciever.fetchAttachment(x);
        }
        this.publish('message', {
            expirationStartTimestamp: ev.data.expirationStartTimestamp,
            body: JSON.parse(ev.data.message.body),
            attachments: ev.data.message.attachments,
            source: ev.data.source,
            sourceDevice: ev.data.sourceDevice,
            timestamp: ev.data.timestamp,
        });
    }

    async onReceipt(ev) {
        this.publish('receipt', {
            source: ev.proto.source,
            sourceDevice: ev.proto.sourceDevice,
            timestamp: ev.proto.timestamp,
        });
    }

    async onSent(ev) {
        for (const x of ev.data.message.attachments) {
            x.data = await this.reciever.fetchAttachment(x);
        }
        this.publish('sent', {
            destination: ev.data.destination,
            expirationStartTimestamp: ev.data.expirationStartTimestamp,
            body: JSON.parse(ev.data.message.body),
            attachments: ev.data.message.attachments,
            source: ev.data.source,
            sourceDevice: ev.data.sourceDevice,
            timestamp: ev.data.timestamp,
        });
    }

    async onRead(ev) {
        this.publish('read', {
            sender: ev.read.sender,
            source: ev.read.source,
            sourceDevice: ev.read.sourceDevice,
            readTimestamp: ev.read.timestamp,
            timestamp: ev.timestamp,
        });
    }

    async onClosingSession(ev) {
        // XXX TBD
        debugger;
        console.error("`closingsession` event not handled");
    }

    onError(ev) {
        this.publish('error', {ev});
    }
}


module.exports = {
    OutgoingV1,
    IncomingV1
};
