const EventEmitter = require('events');

class BestEffortBroadcast extends EventEmitter {
  constructor(processes) {
    super();

    this.processes = processes;

    this.on('broadcast', message => {
      this.processes.forEach(process => {
        process.emit('message', message, this);
      });
    });
  }
}

module.exports = { BestEffortBroadcast };
