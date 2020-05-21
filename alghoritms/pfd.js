const _ = require('lodash');
const { NetworkProcess } = require('./process');

class PerfectFailureDetector extends NetworkProcess {
  constructor(processes) {
    super();

    this.processes = processes;
    this.alive = [];
    this.detected = [];

    this.on('heartbeat', process => {
      setTimeout(() => {
        this.alive.push(process);
      }, 40);
    });
  }

  start() {
    this.alive = this.processes.concat([]);
    setInterval(() => {
      let index = 0;
      while (index < this.processes.length) {
        const process = this.processes[index];
        if (this.alive.indexOf(process) < 0 && this.detected.indexOf(process) < 0) {
          this.detected.push(process);
          console.log(`PFD: ${process.id} crashed`);
          _.remove(this.processes, process);

          this.emit('crash', process);
        } else {
          process.emit('heartbeat', this);
          index++;
        }
      }

      this.alive = [];
    }, 150);
  }
}

module.exports = { PerfectFailureDetector };
