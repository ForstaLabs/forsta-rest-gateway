const relay = require('librelay');


class StateV1 {

    async get(key, params) {
        const setinel = new Object();
        const value = await relay.storage.getState(key, setinel);
        if (value === setinel) {
            return undefined;  // 404
        } else if (value === undefined) {
            return null;  // Prevent 404 response
        } else {
            return value;
        }
    }

    async update(key, data, params) {
        await relay.storage.putState(key, data);
    }

    async remove(key, params) {
        await relay.storage.removeState(key);
    }
}


module.exports = {
    StateV1
};
