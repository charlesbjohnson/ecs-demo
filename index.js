'use strict';

const Good = require('good');
const Hapi = require('hapi');

const server = new Hapi.Server({
  connections: {
    routes: {
      payload: {
        timeout: 5 * 1000
      },
      timeout: {
        server: 10 * 1000,
        socket: 20 * 1000
      }
    }
  }
});

server.app.switch = true;

server.connection({
  port: process.env.PORT || 8000
});

server.register({
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
}, err => {
  if (err) {
    throw err;
  }

  server.route([{
    method: 'GET',
    path: '/flip',
    handler: function (request, reply) {
      const from = Boolean(server.app.switch);
      const to = !server.app.switch;

      request.log(['flip'], {message: 'flipping', from, to});
      server.app.switch = to;

      reply();
    }
  }, {
    method: 'GET',
    path: '/status/{n?}',
    handler: function (request, reply) {
      const path = server.app.switch ? 'succeed' : 'fail';

      server.inject({
        method: 'GET',
        url: `/${path}/${request.params.n || ''}`
      }, response => {
        reply().code(response.statusCode);
      });
    }
  }, {
    method: 'GET',
    path: '/succeed/{wait?}',
    handler: function (request, reply) {
      const wait = (parseInt(request.params.wait, 10) || 0) * 1000;

      request.log(['succeed', 'wait'], {wait});
      setTimeout(() => {
        request.log(['succeed'], {message: 'succeeding'});
        reply();
      }, wait);
    }
  }, {
    method: 'GET',
    path: '/fail/{wait?}',
    handler: function (request, reply) {
      const wait = (parseInt(request.params.wait, 10) || 0) * 1000;

      request.log(['fail', 'wait'], {wait});
      setTimeout(() => {
        request.log(['fail'], {message: 'failing'});
        reply().code(500);
      }, wait);
    }
  }, {
    method: 'GET',
    path: '/block/{wait?}',
    handler: function (request, reply) {
      const wait = (parseInt(request.params.wait, 10) || 0) * 1000;
      const now = Date.now();

      request.log(['block', 'wait'], {wait});
      while (Math.abs(now - Date.now()) < wait) {
        // eslint-disable-next-line no-empty
      }

      request.log(['block'], {message: 'blocking'});
      reply();
    }
  }, {
    method: 'GET',
    path: '/error/{wait?}',
    handler: function (request) {
      const wait = (parseInt(request.params.wait, 10) || 0) * 1000;

      request.log(['error', 'wait'], {wait});
      setTimeout(() => {
        request.log(['error'], {message: 'erroring'});
        throw new Error('error');
      }, wait);
    }
  }, {
    method: 'GET',
    path: '/roulette/{n?}',
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
  }]);

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
