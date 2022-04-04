const { DeviceModel } = require('../models');

class Device{
  constructor(id, title, specification, role, mcId, io) {
    this.id = id || '_' + Math.random().toString(36).substr(2, 9);
    this.title = title || '';
    this.specification = specification;
    this.role = role || '';
    this.mcId = mcId || '';
    this.io = io || '';
  }

  static async which (id) {
    const {title, specification_id, role, mc_id, io} = await DeviceModel.readDevice(id);
    return new Device(id, title, specification_id, role, mc_id, io); // create instances based on records
  }

  static async that (params) {
    if(!params.id){
      params.id = '_' + Math.random().toString(36).substr(2, 9);
    }
    return await DeviceModel.createDevice(new DeviceModel(params))
  }

  async over (params) {
    const { id } = params;
    await DeviceModel.updateDevice(params);
  }

  async nomore (params) {
    const { id } = params;
    await DeviceModel.deleteDevice(id);
  }

};
module.exports = Device;
