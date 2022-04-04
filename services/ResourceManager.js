const ModelAccessor = require('./ModelAccessor');
const Point = require('../classes/point.class');

class ResourceManager {
  constructor(orchestrator, id, networkId, device_map_id, points, systemConfig, operationSetup) {
    this.o = orchestrator;
    this.id = id;
    this.networkId = networkId;
    this.deviceMap = device_map_id;
    this.points = points || [];
    this.systemConfig = systemConfig;
    this.operationSetup = operationSetup;
  }

  setSystemConfig(config) {
    this.systemConfig = config;
  }

  getSystemConfig() {
    return this.systemConfig;
  }

  setOperationSetup(setup) {
    this.operationSetup = setup;
  }

  getOperationSetup() {
    return this.operationSetup;
  }

  async loadData() {
    this.deviceMap = (typeof this.deviceMap == 'string') ? await this.o.loadDeviceMap(this.deviceMap) : {};
    this.points = await Promise.all(this.points.map(async (pid)=>{
      return await Point.which(pid);
    }))
    return await Promise.all([this.deviceMap].concat(this.points))
  }

};
module.exports = ResourceManager;
