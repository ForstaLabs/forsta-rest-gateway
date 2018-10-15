const Handler = require('./handler');
const relay = require('librelay');

class AccountV1 extends Handler {

    constructor(options) {
        super(options);
        this.router.get('/devices/v1', this.asyncRoute(this.onGetDevices));
        this.router.get('/authentication/v1/:userTag', this.asyncRoute(this.onRequestAuthentication));
        this.router.post('/authentication/v1/:userTag', this.asyncRoute(this.onSubmitAuthentication));
    }

    async onGetDevices(req, res) {
        const atlasClient = await relay.AtlasClient.factory();
        return await atlasClient.getDevices();
    }

    async onRequestAuthentication(req, res) {
        const userTag = req.params.userTag;
        const challenge = await relay.AtlasClient.requestAuthentication(userTag);
        return {
            type: challenge.type
        };
    }

    async onSubmitAuthentication(req, res) {
        const userTag = req.params.userTag;
        const body = req.body;
        const type = body.type;
        if (!type) {
            this.throwBadRequest(res, 412, "Missing `type` value");
        }
        if (type === 'password') {
            const password = body.password;
            if (!password) {
                this.throwBadRequest(res, 412, "Missing `password` value");
            }
            await relay.AtlasClient.authenticateViaPassword(userTag, password);
        } else if (type === 'code') {
            const code = body.code;
            if (!code) {
                this.throwBadRequest(res, 412, "Missing `code` value");
            }
            await relay.AtlasClient.authenticateViaCode(userTag, code);
        } else if (type === 'totp') {
            const otp = body.otp;
            const password = body.password;
            if (!password) {
                this.throwBadRequest(res, 412, "Missing `password` value");
            }
            if (!otp) {
                this.throwBadRequest(res, 412, "Missing `otp` value");
            }
            await relay.AtlasClient.authenticateViaPasswordOtp(userTag, password, otp);
        } else {
            this.throwBadRequest(res, 400, "Invalid `type` value");
        }
    }
}


module.exports = {
    AccountV1
};
