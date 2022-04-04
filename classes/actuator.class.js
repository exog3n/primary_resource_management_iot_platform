const Device = require('./device.class.js');

class Actuator extends Device {
  constructor(id, title, specification, role, mcId, io){
    super(id, title, specification, role, mcId, io);
    this.role = 'out';
  }
};
module.exports = Actuator;
