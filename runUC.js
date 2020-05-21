const _ = require('lodash');
const { PerfectFailureDetector } = require('./alghoritms/pfd');
const { NetworkProcess } = require('./alghoritms/process');
const { BestEffortBroadcast } = require('./alghoritms/beb');
const { UniformFloodingConsensus } = require('./alghoritms/uc');

class Decider extends NetworkProcess {
  constructor(id) {
    super();

    this.id = id;

    this.on('message', (message, pl) => {
      setTimeout(() => {
        console.log(`${id}: received ${message.type}`, message.proposals || message.value);
        if (message.type === 'proposal') {
          this.decision = this.decision || 0;
          message.proposal = this.decision;
          console.log(`${id}:${message.round}: decided ${message.proposal}`);
          pl.emit('deliver', this, message);
        } else {
          this.decision = undefined;
        }
      }, 40);
    });
  }
}

const processes = [];
const bestEffortBroadcast = new BestEffortBroadcast(processes);
const pfd = new PerfectFailureDetector(processes);
const c = new UniformFloodingConsensus(bestEffortBroadcast, pfd, processes);

_.times(6, i => {
  const proc = new Decider(i);
  proc.verbose = true;
  processes.push(proc);
});

pfd.start();

// processes[2].willFail(500);
// processes[1].willFail(380);
// processes[0].willFail(540);
// processes[4].willFail(600);

setTimeout(() => {
  c.emit('propose', 125);
}, 500);
