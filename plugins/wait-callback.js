'use strict';

function WaitCallback(type) {
  this.register = (server, options, next) => {
    options = Object.assign({wait: 5000}, options);

    server.ext(type, (request, reply) => {
      setTimeout(() => {
        reply.continue();
      }, options.wait);
    });

    next();
  };

  this.register.attributes = {name: `wait-callback-${type}`};
}

module.exports = WaitCallback;
