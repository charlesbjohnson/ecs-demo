'use strict';

function ServerTimeoutCallback(type) {
  this.register = (server, options, next) => {
    server.ext(type, (request, reply) => {
      setTimeout(() => {
        reply.continue();
      }, 5 * 1000);
    });

    next();
  };

  this.register.attributes = {name: `server-timeout-callback-${type}`};
}

module.exports = ServerTimeoutCallback;
