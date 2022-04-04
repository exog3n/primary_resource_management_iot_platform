const { CommunicationInterfaceModel } = require('../models');

class CommunicationInterface{
  constructor(id, protocol, channel, netId, dClass, q, mcId) {
    this.id = id;
    this.protocol = protocol;
    this.channel = channel;
    this.netId = netId;
    this.dClass = dClass;
    this.q = q || [];
    this.mcId = mcId || null;
  }

  queueShift(number, fromTime, toTime){
    const self = this;
    if(fromTime, toTime){
      let counter = 0;
      let elements = [];
      for(let i = 0 ; i < self.q.length ; i++){
        let e = self.q[i];
        if(e.timestamp > fromTime && e.timestamp <= toTime && counter < number){
          elements.push(e);
          self.q.splice(i,1);
          counter++;
          i--;
        }
      }
      return elements;
    }
    return this.q.splice(0, number);
  }

  flushQueue(){
    this.q = [];
  }

  hasQueue(){
    return this.q.length > 0;
  }

  static async which (id) {
    const {protocol, channel, network_id, dClass, q} = await CommunicationInterfaceModel.readCommunicationInterface(id);
    return new CommunicationInterface(id, protocol, channel, network_id, dClass, q);
  }

  static async that (params) {
      let ci = await CommunicationInterfaceModel.createCommunicationInterface(new CommunicationInterfaceModel(params));
      return ci;
  }

  async over (params) {
    const { id } = params;
    return await CommunicationInterfaceModel.updateCommunicationInterface(params);
  }

  async nomore (params) {
    const { id } = params;
    await CommunicationInterfaceModel.deleteCommunicationInterface(id);
  }

};
module.exports = CommunicationInterface;
