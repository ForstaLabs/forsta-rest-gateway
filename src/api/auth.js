const relay = require('librelay');
const errors = require('@feathersjs/errors');


class AuthV1 {

    constructor({atlasUrl}) {
        this.atlasOptions = {};
        if (atlasUrl) {
            this.atlasOptions.url = atlasUrl;
        }
    }

    async get(userTag, params) {
        const challenge = await relay.AtlasClient.requestAuthentication(userTag,
                                                                        this.atlasOptions);
        return {
            type: challenge.type
        };
    }

    async update(userTag, data, params) {
        const type = data.type;
        if (!type) {
            throw new errors.BadRequest('Missing `type` value');
        }
        if (type === 'password') {
            const password = data.password;
            if (!password) {
                throw new errors.BadRequest('Missing `password` value');
            }
            try {
                await relay.AtlasClient.authenticateViaPassword(userTag, password,
                                                                this.atlasOptions);
            } catch(e) {
                if (e instanceof relay.errors.ProtocolError) {
                    throw new errors.BadRequest({
                        message: e.message,
                        name: e.name,
                        code: e.code,
                        errors: e.response
                    });
                } else {
                    throw e;
                }
            }
        } else if (type === 'sms') {
            const code = data.code;
            if (!code) {
                throw new errors.BadRequest('Missing `code` value');
            }
            try {
                await relay.AtlasClient.authenticateViaCode(userTag, code, this.atlasOptions);
            } catch(e) {
                if (e instanceof relay.errors.ProtocolError) {
                    throw new errors.BadRequest({
                        message: e.message,
                        name: e.name,
                        code: e.code,
                        errors: e.response
                    });
                } else {
                    throw e;
                }
            }
        } else if (type === 'totp') {
            const otp = data.otp;
            const password = data.password;
            if (!password) {
                throw new errors.BadRequest('Missing `password` value');
            }
            if (!otp) {
                throw new errors.BadRequest('Missing `otp` value');
            }
            try {
                await relay.AtlasClient.authenticateViaPasswordOtp(userTag, password, otp,
                                                                   this.atlasOptions);
            } catch(e) {
                if (e instanceof relay.errors.ProtocolError) {
                    throw new errors.BadRequest({
                        message: e.message,
                        name: e.name,
                        code: e.code,
                        errors: e.response
                    });
                } else {
                    throw e;
                }
            }
        } else {
            throw new errors.BadRequest('Invalid `type` value');
        }
        return null;  // 204 No Countent
    }
}


module.exports = {
    AuthV1
};
