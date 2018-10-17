const Handler = require('./handler');
const relay = require('librelay');


class MessagesV1 extends Handler {

    constructor(options) {
        super(options);
        this.router.post('/v1', this.asyncRoute(this.onSend));
    }

    async onSend(req, res) {
        const atlasClient = await relay.AtlasClient.factory();
        const sender = await relay.MessageSender.factory();
        return await sender.send(req.body);
    }
}


module.exports = {
    MessagesV1
};
