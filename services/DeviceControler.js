const IORouter = require('./IORouter');
const Device = require('../classes/device.class');
const Actuator = require('../classes/actuator.class');
const Sensor = require('../classes/sensor.class');
const CommunicationInterface = require('../classes/communicationInterface.class');
const MicroControler = require('../classes/microControler.class');
const OperationProfile = require('../classes/operationProfile.class');

class DeviceControler extends IORouter {

  constructor(rm) {
    super(rm);
    this.config = rm.getSystemConfig() || {};
    this.setup = rm.getOperationSetup() || {};
    this.deviceMap = rm.deviceMap || {};
    this.tree = {};
    this.controlers = [];
    this.interfaces = [];
    this.devSpecifications = {};
    this.devGroups = {};
    this.devices = [];
  }

  async loadData() {
    return await this.rm.o.loadDeviceSpecifications().then(async(devSpecifications) => {
      this.devSpecifications = devSpecifications;
      return await this.rm.o.loadDeviceGroups().then(async(devGroups) => {
        this.devGroups = devGroups;
        return await this.buildHardwareAbstraction();
      });
    });
  }

  async buildHardwareAbstraction(deviceMap){
    const self = this;
    deviceMap = deviceMap || this.deviceMap;
    await Promise.all(deviceMap.nodes.map(async (node) => {
      const rmcId = node.rmc_id;
      await self.loadMicroControlerTree(rmcId, true).then(async(rmc) => {
        return rmc;
      }).then((rmc)=>{
        self.tree[rmc.id] = rmc;
        return rmc;
      })
    })).then(()=>{
      return self.tree;
    });
  }

  async loadMicroControlerTree(i, onlyActives) {
    const self = this;
    return await MicroControler.which(i).then(async (mc) => {
      if (onlyActives && !mc.active) {
        return mc;
      }
      self.controlers.push(mc);
      const ciId = mc.ci;
      return await CommunicationInterface.which(ciId).then(async (ci) => {
        ci.mcId = mc.id;
        mc.ci = ci;
        self.interfaces.push(ci);
        mc.devGroup = self.devGroups.find(devGroup => devGroup.id === mc.devGroup);
        if(mc.devs.length == 0 && mc.devGroup){
          return await self.createDevices(mc.devGroup, i).then(async(devIds) => {
            mc.devs = devIds;
            return await mc.over({id:mc.id, dev_ids: devIds}).then(async () => {
              return await self.loadDevices(mc.devs, mc.id).then((devs)=>{
                mc.devs = devs;
                return mc;
              });
            })
          });

        } else if(mc.devs.length > 0){
          return await self.loadDevices(mc.devs, mc.id).then((devs)=>{
            mc.devs = devs;
            return mc;
          })
        }
      });
  });
}

  async loadDevices(f, c) {
    const self = this;
    const devices = {};
    return await Promise.all(f.map(async (devId) => {
      return await Device.which(devId).then(async (e) => {
        let specId = e.specification;
        let pe = self.devSpecifications.find(s => s.id == specId);
        if (e.role === 'in') {
          e = new Sensor(e.id, e.title, pe, e.role, c, e.io);
        } else if (e.role === 'out') {
          e = new Actuator(e.id, e.title, pe, e.role, c, e.io);
        } else if (e.role === 'forward') {
          e = new Device(e.id, e.title, pe, e.role, c, e.io);
        }
        devices[e.id] = e;
        self.devices[e.id] = e;
        return e;
      });
    }))
    .then(async(devices) => {
      return devices;
    });
  }

  async createDevices(devGroup, mcId) {
    const self = this;
    let l = devGroup.devices;
    return await Promise.all(Object.keys(l).map(async (io) => {
      let type = l[io];
      let pe = this.devSpecifications.find(s => s.type == type);
      let params = {title:type, specification_id:pe.id, role:pe.role, mc_id:mcId, io:io};
      return await Device.that(params).then(async (dev) => {
        return dev.id;
      });
    }));
  }

  setAction(a, action) {
    const self = this;
    let cisHaveMessages = {};
    a.forEach((e)=>{
      let mcId = e.device.mcId;
      const rmc = self.getRootControler(mcId);
      let rci = rmc.ci;
      self.enqueueCommand('action', e, rci);
      cisHaveMessages[rci.id] = rci;
    })

    Object.keys(cisHaveMessages).forEach((ciid)=>{
      let ci = cisHaveMessages[ciid];
      let dClass = ci.dClass;
      const rmc = self.getRootControler(ci.mcId);
      if(dClass == 'C'){
        self.triggerCommand('action', ci, rmc);
      }
    })

  }

  async createMicroControlers(s){
    const self = this;
    return await Promise.all(s.map(async (p) => {
      return await MicroControler.that(p).then((mc)=>{
        return mc;
      })
    }));
  }

  getDevice(device) {
    if(!device.id){
      return this.devices[device];
    }
    return device;
  }

  getDevices(devices, role, type) {
    devices = devices.map(dev => this.getDevice(dev));
    if(role){
      devices = devices.filter((d)=>{
        return d.role == role;
      })
    }
    if(type){
      devices = devices.filter((d)=>{
        let specs = this.config.specifications;
        const devType = Object.keys(specs).find(key => specs[key] == d.specification.type);
        return devType == type;
      })
    }
    return devices;
  }

  getMcDevices(mc, role, type) {
    return this.getDevices(mc.devs, role, type);
  }

  getMcSubDevices(mc, role, type) {
    let subDevices = [];
    let subMcs = (mc.mcs.length) ? mc.mcs.length : Object.values(mc.mcs);
    subMcs.forEach((mmc)=>{
      let mmcDevs = this.getDevices(mmc.devs, role, type);
      subDevices.concat(mmcDevs);
    })
    return subDevices;
  }

  getAllDevices(role, type) {
    return this.getDevices(this.devices, role, type);
  }

  getDeviceIds(devices){
    return devices.map((d => d.id))
  }

  getDeviceIdbyIo(rmc, io){
    if(io[0] === 'f'){
      let meshNodeId = io.substr(1);
      let mmc = Object.values(rmc.mcs).find(mmc => mmc.subgroup === meshNodeId);
      return Object.values(mmc.devs)[0].id;
    } else {
      return rmc.devs.find(d => d.io === io.toString()).id;
    }
  }

  getControler(mcId) {
    const self = this;
    let mc = self.controlers.find(mc => mc.id == mcId);
    return mc;
  }

  getRootControler(mcId) {
    const self = this;
    let rmcId = null;
    if(self.tree[mcId]){
      return self.tree[mcId];
    }
    else {
      let mc = self.controlers.find(mc => mc.id == mcId);
      return self.getControler(mc.parent_mc_id);
    }
  }

};
module.exports = DeviceControler;
