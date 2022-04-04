const Payload = require('./payload.class.js');

class Downlink extends Payload {

  constructor(id, message, timestamp, ci, command){
    super(id, message, timestamp, ci, 'downlink', command);
  }
};
module.exports = Downlink;
