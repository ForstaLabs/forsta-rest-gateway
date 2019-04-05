
const relay = require('librelay');

let _mr = null;
exports.getMessageReceiver = async function() {
    if (!_mr) {
        _mr = await relay.MessageReceiver.factory();
    }
    return _mr;
};

exports.destroyMessageReceiver = function() {
    if (_mr) {
        const mr = _mr;
        _mr = null;
        mr.close();
    }
};

let _ms = null;
exports.getMessageSender = async function() {
    if (!_ms) {
        _ms = await relay.MessageSender.factory();
    }
    return _ms;
};

exports.destroyMessageSender = function() {
    if (_ms) {
        _ms = null;
    }
};
