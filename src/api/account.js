const Handler = require('./handler');
const relay = require('librelay');


class AccountV1 extends Handler {

    constructor(options) {
        super(options);
        this.router.get('/v1', this.asyncRoute(this.onViewAccount));
        this.router.put('/v1', this.asyncRoute(this.onCreateAccount));
    }

    async onViewAccount(req, res) {
        const atlasClient = await relay.AtlasClient.factory();
        return await atlasClient.getDevices();
    }

    async onCreateAccount(req, res) {
        const name = req.body.name || req.headers['user-agent'].split(/[\s/-]/)[0];
        await relay.registerAccount({name});
    }
}


module.exports = {
    AccountV1
};
