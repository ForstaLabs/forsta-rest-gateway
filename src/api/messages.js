const relay = require('librelay');


class OutgoingV1 {
    async create(data, params) {
        const sender = await relay.MessageSender.factory();
        return await sender.send(data);
    }
}


class MessagesV1 {

    constructor(options) {
        this.router.post('/outgoing/v1', this.asyncRoute(this.onOutgoingPost));
        this.router.ws('/incoming/v1', this.onIncomingConnect.bind(this));
        this.wsClients = new Map();
    }

    async onIncomingConnect(ws, req) {
        if (!this.reciever) {
            this.reciever = await relay.MessageReceiver.factory();
            //this.reciever.addEventListener('keychange', this.onRecvKeyChange);
            this.reciever.addEventListener('message', this.onRecvMessage.bind(this));
            //this.reciever.addEventListener('receipt', this.onRecvReceipt);
            this.reciever.addEventListener('sent', this.onRecvSent.bind(this));
            //this.reciever.addEventListener('read', this.onRecvRead);
            //this.reciever.addEventListener('closingsession', this.onRecvClosingSession);
            this.reciever.addEventListener('error', this.onRecvError.bind(this));
            await this.reciever.connect();
        }
        console.info("Client connected:", req.ip);
        this.wsClients.set(ws, {req});
        ws.on('message', data => {
            console.error("Client tried to send data to us!");
            ws.close();
        });
        ws.on('close', () => {
            console.warn("Client disconnected: ", req.ip);
            this.wsClients.delete(ws);
        });
    }

    onRecvMessage(ev) {
        debugger;
        for (const ws of this.wsClients.keys()) {
            ws.send('message', ev);
        }
    }

    onRecvSent(ev) {
        debugger;
        for (const ws of this.wsClients.keys()) {
            ws.send('message', ev);
        }
    }

    onRecvError(ev) {
        debugger;
        for (const ws of this.wsClients.keys()) {
            ws.send('message', ev);
        }
    }

    async onOutgoingPost(req, res) {
        const sender = await relay.MessageSender.factory();
        return await sender.send(req.body);
    }
}


module.exports = {
    MessagesV1,
    OutgoingV1
};
