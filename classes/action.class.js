const Decision = require('./decision.class.js');

class Action extends Decision {
  constructor(devices, type, source, timestamp){
    super(devices, source);
    this.type = type || {};
    this.timestamp = timestamp || null;
  }
};
module.exports = Action;
