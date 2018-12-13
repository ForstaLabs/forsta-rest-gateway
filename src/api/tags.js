const relay = require('librelay');
const errors = require('@feathersjs/errors');


class TagsV1 {

    async find(params) {
        const expression = params.query.expression;
        if (!expression) {
            throw new errors.BadRequest('Missing `expression` query');
        }
        const atlasClient = await relay.AtlasClient.factory();
        return await atlasClient.resolveTags(expression);
    }
}


module.exports = {
    TagsV1
};
