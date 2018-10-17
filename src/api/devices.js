const Handler = require('./handler');
const relay = require('librelay');
const uuid4 = require('uuid/v4');


class DevicesV1 extends Handler {

    constructor(options) {
        super(options);
        this.router.get('/v1', this.asyncRoute(this.onViewDevices));
        this.router.post('/v1', this.asyncRoute(this.onRegisterDevice));
        this.router.get('/registering/v1/:id', this.asyncRoute(this.onViewRegisteringStatus));
        this.registerResults = new Map();
    }

    async onViewDevices(req, res) {
        const atlasClient = await relay.AtlasClient.factory();
        return await atlasClient.getDevices();
    }

    async onRegisterDevice(req, res) {
        const name = req.body.name; // XXX use request headers if not present.
        const autoProvision = req.body.autoProvision;
        const id = uuid4();
        const result = await relay.registerDevice({name, autoProvision});
        this.registerResults.set(id, result);
        return {
            registeringId: id,
            registeringUrn: `${req.baseUrl}/registering/v1/${id}`
        };
    }

    async onViewRegisteringStatus(req, res) {
        const result = this.registerResults.get(req.params.id);
        if (!result) {
            this.throwBadRequest(res, 404, 'Invalid registering id');
        }
        return {
            id: req.params.id,
            waiting: result.waiting,
        };
    }
}


module.exports = {
    DevicesV1
};
