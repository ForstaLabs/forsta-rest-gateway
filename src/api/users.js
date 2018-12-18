const relay = require('librelay');
const errors = require('@feathersjs/errors');


class UsersV1 {

    async find(params) {
        const id_in = params.query.id_in;
        if (!id_in) {
            throw new errors.BadRequest('Missing `id_in` query');
        }
        const atlasClient = await relay.AtlasClient.factory();
        return await atlasClient.getUsers(id_in.split(/[,\s]+/));
    }
}


module.exports = {
    UsersV1
};
