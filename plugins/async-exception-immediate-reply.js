'use strict';

const Bluebird = require('bluebird');

function AsyncExceptionImmediateReply(type) {
  this.register = (server, options, next) => {
    server.ext(type, (request, reply) => {
      setTimeout(() => {
        throw new Error('AsyncException');
      }, 1000);

      Bluebird.delay(1000).then(() => {
        throw new Error('AsyncException');
      });

      reply.continue();
    });

    next();
  };

  this.register.attributes = {name: `async-exception-immediate-reply-${type}`};
}

module.exports = AsyncExceptionImmediateReply;
