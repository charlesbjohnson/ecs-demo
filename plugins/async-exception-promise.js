'use strict';

const Bluebird = require('bluebird');

function AsyncExceptionPromise(type) {
  this.register = (server, options, next) => {
    server.ext(type, () => {
      Bluebird.delay(100).then(() => {
        throw new Error('AsyncException');
      });
    });

    next();
  };

  this.register.attributes = {name: `async-exception-promise-${type}`};
}

module.exports = AsyncExceptionPromise;
