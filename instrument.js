'use strict';

const Difference = require('lodash.difference');
const Omit = require('lodash.omit');

const Instrument = {};

Instrument.register = function (server, options, next) {
  const proto = Object.getPrototypeOf(server);
  const ext = proto.ext;

  let previousRegistrations = [];

  proto.ext = function (events) {

    const registrations = Object.keys(Omit(this.registrations, ['instrument']));
    const newRegistrations = Difference(registrations, previousRegistrations);
    previousRegistrations = registrations;

    debugger

    if (typeof events === 'string') {
      events = {type: arguments[0], method: arguments[1], options: arguments[2]};
    }

    // TODO handle case where events is array

    if (!events.method) {
      return ext.call(this, events);
    }

    if (!Array.isArray(events.method)) {
      events.method = [events.method];
    }

    // TODO
    // get the newest registration

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
