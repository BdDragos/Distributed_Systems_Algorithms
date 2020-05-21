const _ = require('lodash');

const { PerfectFailureDetector } = require('./alghoritms/pfd');
const { BestEffortBroadcast } = require('./alghoritms/beb');
const { UniformReliableBroadcast } = require('./alghoritms/urb');

const processes = [];
const bestEffortBroadcast = new BestEffortBroadcast(processes);
const pfd = new PerfectFailureDetector(processes);

_.times(5, i => {
  const proc = new UniformReliableBroadcast(i, bestEffortBroadcast, pfd, processes);
  proc.verbose = true;
  processes.push(proc);
});

pfd.start();

processes[0].willFail(540);
// processes[2].willFail(500);
// processes[1].willFail(380);
// processes[4].willFail(600);

setTimeout(() => {
  processes[0].broadcast('NEW_URB_DATA');
}, 530);
