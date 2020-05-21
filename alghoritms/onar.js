const EventEmitter = require('events');
const _ = require('lodash');
const { OnarData } = require('./../models/onarData');

class AtomicRegisterONAR extends EventEmitter {
  constructor(beb, pfd, processes) {
    super();

    this.beb = beb;
    this.pfd = pfd;

    this.ts = 0;
    this.val = undefined;
    this.correct = processes;
    this.writeSet = [];
    this.readVal = undefined;
    this.reading = false;

    this.pfd.on('crash', () => {
      this.checkCorrect();
    });

    this.on('read', () => {
      this.reading = true;
      this.readVal = !this.val ? undefined : JSON.parse(JSON.stringify(this.val));
      this.beb.emit('broadcast', new OnarData('WRITE', this.ts, this.val));
    });

    this.on('write', val => {
      this.beb.emit('broadcast', new OnarData('WRITE', this.ts + 1, val));
    });

    this.beb.on('deliver', (p, data) => {
      if (data.timestamp > this.ts) {
        this.ts = data.timestamp;
        this.val = data.value;
        console.log('Value delivered:', this.val);
      }
      p.emit('message', { m: 'ack' }, this);
    });

    this.on('deliver', p => {
      this.writeSet.push(p);
      this.checkCorrect();
    });

    this.on('readReturn', val => {
      console.log('Read ONAR done', val);
    });

    this.on('writeReturn', () => {
      console.log('Write ONAR done');
    });
  }

  checkCorrect() {
    if (_.isEqual(_.intersection(this.correct, this.writeSet), this.correct)) {
      this.writeSet = [];
      if (this.reading) {
        this.reading = false;
        this.emit('readReturn', this.readVal);
      } else {
        this.emit('writeReturn');
      }
    }
  }
}

module.exports = { AtomicRegisterONAR };
