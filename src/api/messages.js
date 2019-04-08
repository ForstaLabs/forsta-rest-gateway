const factory = require('../factory');
const queueAsync = require('../queue_async');


class OutgoingV1 {
    async create(data, params) {
        const sender = await factory.getMessageSender();
        return await sender.send(data);
    }
}


class IncomingV1 {

    constructor(ws) {
        this.clients = new Set();
        this._queuedEvents = [];
        this._id = `api-incoming-messages-v1-${parseInt(Number.MAX_SAFE_INTEGER * Math.random())}`;
    }

    publish(event, data, options={}) {
        return queueAsync(this._id + '-publish', () => this._publish(event, data, options));
    }

    async _publish(event, data, {prehook}) {
        if (!this.clients.size) {
            console.warn(`Queuing ${event} event.  No clients are connected.`);
            this._queuedEvents.push({event, data, prehook});
            return;
        }
        if (prehook) {
            await prehook(event, data);
        }
        const payload = JSON.stringify({event, data});
        console.info(`Publishing ${event} event to ${this.clients.size} client(s).`);
        for (const ws of this.clients) {
            ws.send(payload);
        }
    }

    onConnection(ws, req) {
        console.info("Client connected:", req.ip);
        this.clients.add(ws);
        ws.on('close', () => {
            console.warn("Client disconnected: ", req.ip);
            this.clients.delete(ws);
            if (!this.clients.size && this.receiver) {
                console.warn("Last client disconnected: Shutting down message receiver");
                this.receiver = null;
                factory.destroyMessageReceiver();
            }
        });
        return queueAsync(this._id + '-connection', () => this._handleConnection(ws, req));
    }

    async _handleConnection(ws, req) {
        while (this._queuedEvents.length) {
            const desc = this._queuedEvents.shift();
            console.warn(`Publishing queued event: ${this._queuedEvents.length} remaining.`);
            // Note the first client to connect is likely to get all the queued messages.
            // The system is essentially optimized for a single consumer as of yet.
            await this.publish(desc.event, desc.data, {prehook: desc.prehook});
        }
        if (!this.receiver) {
            console.info("Starting new message receiver...");
            this.receiver = await factory.getMessageReceiver();
            console.info("  Atlas URL:", this.receiver.atlas.url);
            console.info("  Signal URL:", this.receiver.signal.url);
            this.receiver.addEventListener('keychange', this.onKeyChange.bind(this));
            this.receiver.addEventListener('message', this.onMessage.bind(this));
            this.receiver.addEventListener('receipt', this.onReceipt.bind(this));
            this.receiver.addEventListener('sent', this.onSent.bind(this));
            this.receiver.addEventListener('read', this.onRead.bind(this));
            this.receiver.addEventListener('closingsession', this.onClosingSession.bind(this));
            this.receiver.addEventListener('error', this.onError.bind(this));
            this.receiver.addEventListener('close', this.onClose.bind(this));
            await this.receiver.connect();
            console.info("Message receiver connected.");
        }
    }

    async onKeyChange(ev) {
        // XXX TBD  Probably just auto accept for now.
        console.error("`keychange` event not properly exposed: Auto accepting key change! DANGEROUS");
        await ev.accept();
    }

    async fetchAttachmentsPrehook(ev, data) {
        const pointers = data.attachmentPointers;
        delete data.attachmentPointers;
        if (!pointers.length) {
            return;
        }
        console.info(`Fetching ${pointers.length} attachment(s)...`);
        data.attachments = [];
        for (const p of pointers) {
            const buf = await this.receiver.fetchAttachment(p);
            data.attachments.push({
                id: p.id.toString(),
                contentType: p.contentType,
                data: buf.toString('base64')
            });
        }
        console.debug('Finished attachment(s) fetch.');
    }

    async onMessage(ev) {
        await this.publish('message', {
            expirationStartTimestamp: ev.data.expirationStartTimestamp,
            body: JSON.parse(ev.data.message.body),
            attachmentPointers: ev.data.message.attachments,
            source: ev.data.source,
            sourceDevice: ev.data.sourceDevice,
            timestamp: ev.data.timestamp,
        }, {prehook: this.fetchAttachmentsPrehook.bind(this)});
    }

    async onSent(ev) {
        await this.publish('sent', {
            destination: ev.data.destination,
            expirationStartTimestamp: ev.data.expirationStartTimestamp,
            body: JSON.parse(ev.data.message.body),
            attachmentPointers: ev.data.message.attachments,
            source: ev.data.source,
            sourceDevice: ev.data.sourceDevice,
            timestamp: ev.data.timestamp,
        }, {prehook: this.fetchAttachmentsPrehook.bind(this)});
    }

    async onReceipt(ev) {
        await this.publish('receipt', {
            source: ev.proto.source,
            sourceDevice: ev.proto.sourceDevice,
            timestamp: ev.proto.timestamp,
        });
    }

    async onRead(ev) {
        await this.publish('read', {
            sender: ev.read.sender,
            source: ev.read.source,
            sourceDevice: ev.read.sourceDevice,
            readTimestamp: ev.read.timestamp,
            timestamp: ev.timestamp,
        });
    }

    async onClosingSession(ev) {
        // XXX TBD
        console.error("`closingsession` event not handled");
    }

    async onError(ev) {
        await this.publish('error', {ev});
    }

    onClose(ev) {
        console.warn("Message Receiver closed");
        if (this.receiver) {
            this.receiver = null;
            if (this.clients.size) {
                console.warn(`Shutting down ${this.clients.size} client connections...`);
                for (const x of this.clients) {
                    x.close();
                }
            }
        }
    }
}


module.exports = {
    OutgoingV1,
    IncomingV1
};
