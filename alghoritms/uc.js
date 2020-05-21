const EventEmitter = require('events');
const _ = require('lodash');

const { UniformInformations } = require('./../models/uniformInformations');

class UniformFloodingConsensus extends EventEmitter {
  constructor(beb, pfd, processes) {
    super();

    this.beb = beb;
    this.pfd = pfd;

    this.correct = processes;
    this.round = 1;
    this.decision = undefined;
    this.receivedFrom = [processes.concat()];
    this.proposals = [];

    this.on('propose', v => {
      if (!this.proposals[1]) {
        this.proposals[1] = [];
      }
      this.proposals[1].push(v);
      this.beb.emit('broadcast', new UniformInformations('proposal', 1, this.proposals[1]));
    });

    this.beb.on('deliver', (p, data) => {
      if (data.type === 'proposal') {
        if (!this.receivedFrom[data.round]) {
          this.receivedFrom[data.round] = [];
        }

        if (!this.proposals[data.round]) {
          this.proposals[data.round] = [];
        }

        this.receivedFrom[data.round].push(p);
        this.proposals[data.round].push(data.proposal);
      }

      this.isDecided();
    });

    this.pfd.on('crash', () => {
      this.isDecided();
    });

    this.on('decide', data => {
      console.log('Decided value: ', data);
    });
  }

  isDecided() {
    if (_.isEqual(_.intersection(this.correct, this.receivedFrom[this.round]), this.correct) && !this.decision) {
      if (_.isEqual(this.receivedFromIds(this.round), this.receivedFromIds(this.round - 1))) {
        this.decision = Math.min(...this.proposals[this.round]);
        this.beb.emit('broadcast', new UniformInformations('decided', this.decision));
        this.emit('decide', this.decision);
      } else {
        this.round++;
        this.beb.emit('broadcast', new UniformInformations('proposal', this.round, this.proposals[this.round - 1].concat()));
      }
    }
  }

  receivedFromIds(round) {
    return this.receivedFrom[round].map(it => it.id).sort();
  }
}

module.exports = { UniformFloodingConsensus };
