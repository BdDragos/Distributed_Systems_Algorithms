const _ = require('lodash');
const { Process } = require('./process');

class UniformReliableBroadcast extends Process {
  constructor(id, beb, pfd, processes) {
    super(id);

    this.delivered = [];
    this.pending = [];
    this.correct = processes;
    this.ack = {};
    this.beb = beb;
    this.pfd = pfd;

    this.beb.on('deliver', (p, message) => {
      if (this.hasFailed) {
        return;
      }
      setTimeout(() => {
        console.log(`BEB ${this.id}: deliver ${p.id}`);

        if (!this.ack[message.m]) {
          this.ack[message.m] = [];
        }
        this.ack[message.m].push(p);

        if (_.findIndex(this.pending, { s: message.s, m: message.m }) < 0) {
          this.pending.push({ s: message.s, m: message.m });
          this.beb.emit('braodcast', message);
        }

        this.willDeliver(message.s, message.m);
      }, 40);
    });

    this.pfd.on('crash', () => {
      this.pending.forEach(message => {
        this.willDeliver(message.s, message.m);
      });
    });

    this.on('deliver', (s, m) => {
      console.log(`URB ${this.id}: ${m} from ${s.id} to`, this.ack[m].map(it => it.id));
    });
  }

  canDeliver(m) {
    return _.isEqual(_.intersection(this.correct, this.ack[m]), this.correct);
  }

  willDeliver(s, m) {
    if (_.findIndex(this.pending, { s: s, m: m }) > -1 && this.canDeliver(m) && this.delivered.indexOf(m) < 0) {
      this.delivered.push(m);
      this.emit('deliver', s, m);
    }
  }

  broadcast(message) {
    this.pending.push({ s: this, m: message });
    this.beb.emit('broadcast', { DATA: null, s: this, m: message });
  }
}

module.exports = { UniformReliableBroadcast };
