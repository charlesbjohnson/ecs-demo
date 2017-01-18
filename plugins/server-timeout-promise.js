'use strict';

const Bluebird = require('bluebird');

function ServerTimeoutPromise(type) {
  this.register = (server, options, next) => {
    server.ext(type, (request, reply) => {
      Bluebird.delay(5 * 1000).then(() => {
        reply.continue();
      });
    });

    next();
  };

  this.register.attributes = {name: `server-timeout-callback-${type}`};
}

module.exports = ServerTimeoutPromise;
