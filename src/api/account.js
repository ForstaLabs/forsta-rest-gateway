const relay = require('librelay');


class AccountV1 {

    async find(params) {
        const atlasClient = await relay.AtlasClient.factory();
        return await atlasClient.getDevices();
    }

    async create(data, params) {
        const name = data.name || req.headers['user-agent'].split(/[\s/-]/)[0];
        await relay.registerAccount({name});
        return null;  // 204 No Countent
    }
}


module.exports = {
    AccountV1
};
