const EventEmitter = require('events');

class NetworkProcess extends EventEmitter {
  constructor() {
    super();

    this.on('heartbeat', pfd => {
      setTimeout(() => {
        pfd.emit('heartbeat', this);
      }, 40);
    });
  }

  willFail(timeout) {
    setTimeout(() => {
      this.hasFailed = true;
      this.removeAllListeners();
    }, timeout);
  }
}

class Process extends NetworkProcess {
  constructor(id) {
    super();

    this.id = id;

    this.on('message', (message, pl) => {
      setTimeout(() => {
        if (this.verbose) {
          console.log(`${id}: received`, message.m || message.value);
        }
        pl.emit('deliver', this, message);
      }, 40);
    });
  }
}

module.exports = { Process, NetworkProcess };
