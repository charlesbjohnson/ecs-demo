'use strict';

const Good = require('good');
const Hapi = require('hapi');

const Instrument = require('./instrument');
const Plugins = require('./plugins');

const server = new Hapi.Server({
  connections: {
    routes: {
      payload: {
        timeout: 1 * 1000
      },
      timeout: {
        server: 5 * 1000,
        socket: 10 * 1000
      }
    }
  }
});

server.connection({port: process.env.PORT || 8000});
server.app.switch = true;

server.method('wait', (request, next, options) => {
  options = Object.assign({block: false, action: 'action'}, options);

  const wait = (parseInt(request.params.wait, 10) || 0) * 1000;
  const message = `${options.action}ing`;

  request.log([options.action, 'wait'], {wait});

  if (options.block) {
    const now = Date.now();
    while (Math.abs(now - Date.now()) < wait) {
      // eslint-disable-next-line no-empty
    }

    request.log([options.action], {message});
    return next();
  }

  setTimeout(() => {
    request.log([options.action], {message});
    next();
  }, wait);
});

server.route([{
  method: 'GET',
  path: '/flip',
  config: {
    handler: function (request, reply) {
      const from = Boolean(server.app.switch);
      const to = !server.app.switch;

      request.log(['flip'], {message: 'flipping', from, to});
      server.app.switch = to;

      reply();
    }
  }
}, {
  method: 'GET',
  path: '/status/{n?}',
  config: {
    handler: function (request, reply) {
      const path = server.app.switch ? 'succeed' : 'fail';

      server.inject({
        method: 'GET',
        url: `/${path}/${request.params.n || ''}`
      }, response => {
        reply().code(response.statusCode);
      });
    }
  }
}, {
  method: 'GET',
  path: '/succeed/{wait?}',
  config: {
    handler: function (request, reply) {
      server.methods.wait(request, () => reply(), {action: 'succeed'});
    }
  }
}, {
  method: 'GET',
  path: '/fail/{wait?}',
  config: {
    handler: function (request, reply) {
      server.methods.wait(request, () => reply().code(500), {action: 'fail'});
    }
  }
}, {
  method: 'GET',
  path: '/block/{wait?}',
  config: {
    handler: function (request, reply) {
      server.methods.wait(request, () => reply(), {
        action: 'block',
        block: true
      });
    }
  }
}, {
  method: 'GET',
  path: '/error/{wait?}',
  config: {
    handler: function (request) {
      server.methods.wait(request, () => {
        throw new Error('error');
      }, {action: 'error'});
    }
  }
}, {
  method: 'GET',
  path: '/roulette/{n?}',
  config: {
    handler: function (request, reply) {
      const fortune = Math.random() * 100;
      const path = fortune < 75 ? 'succeed' : 'fail';

      server.inject({
        method: 'GET',
        url: `/${path}/${request.params.n || ''}`
      }, response => {
        reply().code(response.statusCode);
      });
    }
  }
}]);

server.register([{
  register: Instrument
}, {
  register: Good,
  options: {
    reporters: {
      stdout: [{
        module: 'good-squeeze',
        name: 'Squeeze',
        args: [{log: '*', error: '*', request: '*', response: '*'}]
      }, {
        module: 'good-squeeze',
        name: 'SafeJson'
      }, 'stdout']
    }
  }
}, {
  register: new Plugins.WaitCallback('onRequest'),
  options: {wait: 100}
}], err => {
  if (err) {
    throw err;
  }

  server.start(err => {
    if (err) {
      throw err;
    }

    server.log(['server', 'start'], {message: 'server started', port: server.info.port});
  });
});

process.on('SIGTERM', () => {
  server.log(['server', 'stop'], {message: 'server stopping'});
  server.stop({timeout: 10 * 1000});
});

process.on('SIGINT', () => {
  server.log(['server', 'stop'], {message: 'server stopping'});
  server.stop({timeout: 5 * 1000});
});
