'use strict';

const Bluebird = require('bluebird');

function WaitPromise(type) {
  this.register = (server, options, next) => {
    options = Object.assign({wait: 5000}, options);

    server.ext(type, (request, reply) => {
      Bluebird.delay(options.wait).then(() => {
        reply.continue();
      });
    });

    next();
  };

  this.register.attributes = {name: `wait-promise-${type}`};
}

module.exports = WaitPromise;
