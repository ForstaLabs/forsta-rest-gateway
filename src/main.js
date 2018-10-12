
const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');
const process = require('process');

const port = process.env.PORT || '8086';
const listenAddr = process.env.LISTEN_ADDR || '127.0.0.1';


let _rejectCount = 0;
process.on('unhandledRejection', ev => {
    console.error(ev);
    if (_rejectCount++ > 100) {
        console.error("Reject count too high, killing process.");
        process.exit(1);
    }
});


async function main() {
    const app = express();
    app.use(morgan('dev')); // logging
    app.use(bodyParser.json());
    //this.app.use('/api/onboard/', (new api.OnboardAPIV1({server: this})).router);
    //this.app.use('/api/auth/', (new api.AuthenticationAPIV1({server: this})).router);
    app.use((req, res, next) => {
        res.status(404).json({
            error: 'bad_request',
            message: 'not_found'
        });
    });
    app.use((error, req, res, next) => {
        res.status(500).json({
            error: 'server',
            message: error
        });
    });
    app.listen(port, listenAddr);
}


main();
