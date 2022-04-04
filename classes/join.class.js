const Payload = require('./payload.class.js');

class Join extends Payload {

  constructor(id, timestamp, ci){
    super(id, null, timestamp, ci, 'join');
  }

};
module.exports = Join;
