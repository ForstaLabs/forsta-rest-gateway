const express = require('express');


class Handler {
    constructor({timeout=1000}) {
        this.timeout = timeout;  // ms
        this.router = express.Router();
    }

    asyncRoute(fn) {
        /* Add error handling for async exceptions.  Otherwise the server just hangs
         * the request or subclasses have to do this by hand for each async routine. */
        return (req, res, next) => {
            fn.call(this, req, res).then(data => {
                if (res.finished) {
                    return;
                }
                if (data === undefined) {
                    res.status(204).end();
                } else {
                    res.status(200).json(data);
                }
            }).catch(e => {
                if (res.finished) {
                    return;
                }
                next(e);
            });
            if (this.timeout) {
                setTimeout(() => {
                    if (res.finished) {
                        return;
                    }
                    res.status(500).json({
                        error: 'timeout',
                        timeout: this.timeout / 1000,  // seconds
                        message: 'Server timeout trying to process request.' 
                    });
                }, this.timeout);
            }
        }
    }

    throwBadRequest(res, code=400, message="Bad Request", extra={}) {
        res.status(code).json(Object.assign({message}, extra));
        throw new Error("stop");
    }
}

module.exports = Handler;
