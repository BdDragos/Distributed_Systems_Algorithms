class UniformInformations {
  constructor(type, round, proposals) {
    this.type = type;
    if (proposals) {
      this.round = round;
      this.proposals = proposals;
    } else {
      this.value = round;
    }
  }
}

module.exports = { UniformInformations };
