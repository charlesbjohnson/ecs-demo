'use strict';

const Hapi = require('hapi');
const Good = require('good');

const server = new Hapi.Server();
server.app.switch = true;

server.connection({
  port: process.env.PORT || 8000
});

server.register({
  register: Good,
  options: {
    reporters: {
      console: [{
        module: 'good-squeeze',
        name: 'Squeeze',
        args: [{ log: '*' }]
      }, {
        module: 'good-console',
      }, 'stdout'],
      file: [{
        module: 'good-squeeze',
        name: 'Squeeze',
        args: [{ log: '*' }]
      }, {
        module: 'good-squeeze',
        name: 'SafeJson',
      }, {
        module: 'good-file',
        args: ['./logs/server.log']
      }]
    }
  }
}, (err) => {
  if (err) {
    throw err;
  }

  server.route([{
    method: 'GET',
    path: '/v1/health',
    handler: function (request, reply) {
      reply({ healthy: true });
    }
  }, {
    method: 'GET',
    path: '/flip',
    handler: function (request, reply) {
      const from = Boolean(server.app.switch);
      const to = !Boolean(server.app.switch);

      server.log('flipping', { from, to });
      server.app.switch = to;

      reply();
    }
  }, {
    method: 'GET',
    path: '/status/{n?}',
    handler: function (request, reply) {
      let path = '/succeed';
      if (!server.app.switch) {
        path = '/fail';
      }

      server.inject({
        method: 'GET',
        url: `${path}/${request.params.n}`
      }, (response) => {
        reply().code(response.statusCode);
      });
    }
  }, {
    method: 'GET',
    path: '/succeed/{n?}',
    handler: function (request, reply) {
      const n = (parseInt(request.params.n, 10) || 0) * 1000;
      server.log(`waiting ${n} seconds`);

      setTimeout(() => {
        server.log('succeeding');
        reply();
      }, n);
    }
  },
  {
    method: 'GET',
    path: '/fail/{n?}',
    handler: function (request, reply) {
      const n = (parseInt(request.params.n, 10) || 0) * 1000;
      server.log(`waiting ${n} seconds`);

      setTimeout(() => {
        server.log('failing');
        reply().code(500);
      }, n);
    }
  },
  {
    method: 'GET',
    path: '/hang/{n?}',
    handler: function (request, reply) {
      const n = (parseInt(request.params.n, 10) || 0) * 1000;
      server.log(`waiting ${n} seconds`);

      setTimeout(() => {
        server.log('hanging');

        while (true) { }
      }, n);
    }
  }, {
    method: 'GET',
    path: '/die/{n?}',
    handler: function (request, reply) {
      const n = (parseInt(request.params.n, 10) || 0) * 1000;
      server.log(`waiting ${n} seconds`);

      setTimeout(() => {
        server.log('dying');
        process.exit(1);
      }, n);
    }
  }, {
    method: 'GET',
    path: '/roulette/{n?}',
    handler: function (request, reply) {
      const fortune = Math.random() * 100;
      let path = '/succeed';

      if (fortune >= 75) {
        path = '/fail';
      }

      server.inject({
        method: 'GET',
        url: `${path}/${request.params.n}`
      }, (response) => {
        reply().code(response.statusCode);
      });
    }
  }]);

  server.start((err) => {
    if (err) {
      throw err;
    }

    server.log('Server started', {port: server.info.port})
  });
});

process.on('SIGTERM', () => {
  server.stop({ timeout: 5 * 1000 }, () => {
    process.exit(0);
  });
});
