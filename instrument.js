'use strict';

const Instrument = {};

Instrument.register = function (server, options, next) {
  const proto = Object.getPrototypeOf(server);
  const ext = proto.ext;

  proto.ext = function (events) {
    if (typeof events === 'string') {
      events = {type: arguments[0], method: arguments[1], options: arguments[2]};
    }

    if (!events.method) {
      return ext.call(this, events);
    }

    if (!Array.isArray(events.method)) {
      events.method = [events.method];
    }

    for (let i = 0; i < events.method.length; i++) {
      let method = events.method[i];

      events.method[i] = function () {
        console.log('start');
        const reply = arguments[1];

        if (reply.continue) {
          arguments[1] = function (err, response) {
            console.log('end');
            reply(err, response);
          };

          arguments[1].continue = function (data) {
            console.log('end');
            reply.continue(data);
          };
        }

        return method.apply(this, arguments);
      };
    }

    return ext.call(this, events);
  };

  next();
};

Instrument.register.attributes = {name:'instrument'};

module.exports = Instrument;
