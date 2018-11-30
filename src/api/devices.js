const errors = require('@feathersjs/errors');
const relay = require('librelay');
const uuid4 = require('uuid/v4');

const registerResults = new Map();


class DevicesV1 {

    async find(id, params) {
        const atlasClient = await relay.AtlasClient.factory();
        return await atlasClient.getDevices();
    }

    async create(data, params) {
        const name = data.name || req.headers['user-agent'].split(/[\s/-]/)[0];
        const autoProvision = data.autoProvision;
        const id = uuid4();
        const result = await relay.registerDevice({name, autoProvision});
        registerResults.set(id, result);
        return {
            registeringId: id,
            registeringUrn: `/devices/registering/v1/${id}`
        };
    }
}


class DevicesRegisteringV1 {

    async get(id, params) {
        const result = registerResults.get(id);
        if (!result) {
            throw new errors.NotFound('Invalid registering id');
        }
        const setinel = new Object();
        let status;
        try {
            const done = await Promise.race([result.done, setinel]);
            status = done === setinel ? 'pending' : 'complete';
        } catch(e) {
            console.warning("Registration error detected:", e);
            status = e.message;
        }
        // XXX/TODO cleanup if done?
        return {
            id,
            waiting: result.waiting,
            status
        };
    }
}


module.exports = {
    DevicesV1,
    DevicesRegisteringV1
};
