const _ = require('lodash');

const { PerfectFailureDetector } = require('./alghoritms/pfd');
const { Process } = require('./alghoritms/process');
const { BestEffortBroadcast } = require('./alghoritms/beb');
const { AtomicRegisterONAR } = require('./alghoritms/onar');

const processes = [];
const bestEffortBroadcast = new BestEffortBroadcast(processes);
const pfd = new PerfectFailureDetector(processes);
const onar = new AtomicRegisterONAR(bestEffortBroadcast, pfd, processes);

_.times(6, i => {
  const proc = new Process(i);
  proc.verbose = true;
  processes.push(proc);
});

pfd.start();

// processes[2].willFail(500);
// processes[1].willFail(380);
// processes[0].willFail(540);
// processes[4].willFail(600);

setTimeout(() => {
  onar.emit('read');
  onar.emit('write', 'NEW_ONAR_VALUE');
  onar.emit('read');
}, 530);
