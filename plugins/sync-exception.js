'use strict';

function SyncException(type) {
  this.register = (server, options, next) => {
    server.ext(type, () => {
      throw new Error('SyncException');
    });

    next();
  };

  this.register.attributes = {name: `sync-exception-${type}`};
}

module.exports = SyncException;
