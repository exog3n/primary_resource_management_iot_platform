const Device = require('./device.class.js');

class Sensor extends Device {

  constructor(id, title, specification, role, mcId, io){
    super(id, title, specification, role, mcId, io);
    this.role = 'in';
  }
};
module.exports = Sensor;
