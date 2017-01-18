'use strict';

function AsyncExceptionCallback(type) {
  this.register = (server, options, next) => {
    server.ext(type, () => {
      setTimeout(() => {
        throw new Error('AsyncException');
      }, 1000);
    });

    next();
  };

  this.register.attributes = {name: `async-exception-callback-${type}`};
}

module.exports = AsyncExceptionCallback;
