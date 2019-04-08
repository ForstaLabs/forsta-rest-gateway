relay-rest-gateway
========
REST API for Forsta librelay-node

[![NPM](https://img.shields.io/npm/v/relay-rest-gateway.svg)](https://www.npmjs.com/package/relay-rest-gateway)
[![License](https://img.shields.io/npm/l/relay-rest-gateway.svg)](https://github.com/ForstaLabs/relay-rest-gateway)


About
--------
The relay-rest-gateway service provides a language agnostic interface to
external software projects via a HTTP REST API.  Applications that are not
compatible with the GPL3 can then safely make use of the Forsta Messaging
platform without tainting their licensing.

See https://github.com/ForstaLabs/librelay-node for more information.


Running
--------
The rest gateway listens on port **8086** by default and with the exception of
the docker runtime will only listen for connections from `localhost`.  This is
by design as the rest gateway should run as a *sidecar* to your application.

**No public or external access should ever be granted to the rest gateway.**

### Docker
    docker run -p8086:8086 forstalabs/relay-rest-gateway

### NPM
    npm install -g relay-rest-gateway
    relay-rest-gateway


Examples
--------
For now just browse the examples folder:  [All Examples](examples/)
