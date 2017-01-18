'use strict';

function NoReply(type) {
  this.register = (server, options, next) => {
    server.ext(type, () => {
      // No reply
    });

    next();
  };

  this.register.attributes = {name: `no-reply-${type}`};
}

module.exports = NoReply;
