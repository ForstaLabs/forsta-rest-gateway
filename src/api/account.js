const relay = require('librelay');
const factory = require('../factory');


class AccountV1 {

    async find(params) {
        const atlasClient = await relay.AtlasClient.factory();
        return await atlasClient.getDevices();
    }

    async create(data, params) {
        const name = data.name || 'relay-rest-gateway';
        console.warn("Creating/resetting account...");
        await relay.registerAccount({name});
        console.warn("Destroying any existing signal connections...");
        factory.destroyMessageReceiver();
        factory.destroyMessageSender();
        return null;  // 204 No Content
    }
}


module.exports = {
    AccountV1
};
