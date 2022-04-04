const NetworkGateway = require('./NetworkGateway');
const APIRouter = require('./APIRouter');
const RequestHandler = require('./RequestHandler');
const ResourceManager = require('./ResourceManager');
const ModelAccessor = require('./ModelAccessor');
const DeviceControler = require('./DeviceControler');
const OperationComposer = require('./OperationComposer');
const DataHandler = require('./DataHandler');
const DecisionProcessor = require('./DecisionProcessor');
const Parser = require('./Parser');
const JobManager = require('./JobManager');

const Measurement = require('../classes/measurement.class');
const Event = require('../classes/event.class');
const Point = require('../classes/point.class');
const systemOptions = require('../data/system.json');

class Orchestrator extends ModelAccessor{

  constructor(app) {
    super();
    this.app = app;
    this.networkGateway = new NetworkGateway(app);
    this.parser = new Parser(app);
    this.resourceManagers = {};
  }

  async init() {
    const self = this;
    self.loadManagers().then(async (device) => {
      if (device.length == 0) {
        throw new Error('* No resource managers exists in the database. Please insert data or run "restore.js" *');
        return;
      }
      await Promise.all(device.map(async (i) => {await self.initResourceManager(i)})).then(()=>{
        console.log('* Cloud is ready. *')
      })
    });
    self.networkGateway.listen(self, self.inputPayload);
    self.requestHandler = new RequestHandler(self.app, self);
    const handlers = self.requestHandler.initHandlers();
    self.APIRouter = new APIRouter(self.app, self, self.requestHandler);
    self.APIRouter.initRoutes();
  }

  async initResourceManager(resourceManagerModel) {
    const self = this;
    const {
      id,
      network_id,
      device_map_id,
      point_ids,
    } = resourceManagerModel;

    let systemConfig = self.loadSystemConfiguration();
    let operationSetup = self.loadOperationSetup();

    const rm = new ResourceManager(self, id, network_id, device_map_id, point_ids, systemConfig, operationSetup);
    return await rm.loadData().then(async () => {
      rm.operationComposer = new OperationComposer(rm);
      rm.deviceControler = new DeviceControler(rm);
      rm.jobManager = new JobManager(rm);
      await rm.deviceControler.loadData().then(async () => {
        let activeRmcs = rm.deviceControler.controlers.filter(mc => mc.role === 'rmc').filter(mc => mc.active == true);
        await rm.operationComposer.initializeOperationProfiles(activeRmcs).then(() => {
          rm.dataHandler = new DataHandler(rm);
          rm.decisionProcessor = new DecisionProcessor(rm, this.parser, rm.jobManager);
           console.log('ResourceManager', rm.id, 'is ready.')
          return rm;
        });
        return rm;
      });
      self.resourceManagers[id] = rm;
      return rm;
    });
  }

  inputPayload(payload, type) {
    const self = this;
    const rms = Object.values(this.resourceManagers).find((rm) => {return rm.networkId == payload.end_device_ids.application_ids.application_id})
    const id = payload.correlation_ids[0].replace(/[as:up]/g, '');
    try{
      const ci = rms.deviceControler.interfaces.find((i) => i.id == payload.end_device_ids.device_id);
      if(!ci){
              throw new Error('No communication interface with id '+payload.end_device_ids.device_id+ ' exists.');
      }
      let rmc = rms.deviceControler.getRootControler(ci.mcId);
      const timestamp = new Date(payload.received_at).getTime();
      if(type == 'uplink'){
        let raw = payload.uplink_message.decoded_payload.raw;
        const b64 = payload.uplink_message.frm_payload;
        let info = {
          f_cnt: payload.uplink_message.f_cnt,
          f_port: payload.uplink_message.f_port,
          frm_payload: payload.uplink_message.frm_payload,
          gw_id: payload.uplink_message.rx_metadata[0].gateway_ids.gateway_id,
          rssi: payload.uplink_message.rx_metadata[0].rssi,
          snr: payload.uplink_message.rx_metadata[0].snr,
          channel_index: payload.uplink_message.rx_metadata[0].channel_index,
          channel_rssi: payload.uplink_message.rx_metadata[0].channel_rssi,
          spreading_factor: payload.uplink_message.settings.data_rate.lora.spreading_factor,
          bandwidth: payload.uplink_message.settings.data_rate.lora.bandwidth,
          data_rate_index: payload.uplink_message.settings.data_rate_index,
          coding_rate: payload.uplink_message.settings.coding_rate,
          frequency: payload.uplink_message.settings.frequency,
          toa: null,
        }

        let uplink = null;
        if(rmc.devGroup.legacy){
          if(!rmc.op){
            rms.operationComposer.initializeOperationProfile(rmc);
          }

          // legacy temporary protocol compatibility interpreter - raw is of type 0.00_0.00_0.00_0.00_0.00 // TOGO
          raw = ['r', Math.round(timestamp / 1000), '_'].concat(raw.split('_').filter(part => part != '').map((v, i) => {
            return i+'m'+v;
          }).join('_')).join('');


          // legacy downlink demo TOGO
          // rms.deviceControler.createDownlink({peer:rmc.ci, data: {text:'10010'}}, rms.deviceControler.sendDownlink, timestamp+50000);
        }

        uplink = rms.deviceControler.gatherUplink(id, raw, b64, timestamp, ci, info);

        if(uplink.command == 'continue'){
          rms.deviceControler.triggerCommand('operation_profile', rmc.ci, rmc);
        }
        if(uplink.command == 'report'){
          const inputData = rms.dataHandler.gatherReportsFromDevices(uplink, timestamp);
          rms.dataHandler.storeData(inputData);
          rms.deviceControler.triggerCommand('action', ci, rmc);
        }
      }
      else if (type == 'join'){
        const join = rms.deviceControler.gatherJoin(id, timestamp, ci);
      }
    }catch(e){console.log(e)}
  }

  async generateResourceManagerOptions(user) {
    const self = this;
    const systemConfig = self.loadSystemConfiguration();
    return await self.loadDefaultOptions().then((data) => {
      let generationOptions = {
        options:{
            tasks:Object.keys(systemConfig.tasks),
            location_types:["station", "crop", "field", "collector", "route", "resource"],
            specifications: systemConfig.specifications,
            operation:{
              minimumUplinkInterval: systemConfig.communication.protocol.edge.minimumUplinkInterval
            }
        },
        device_groups: data[1],
        communication_interfaces: data[2].filter((ci)=>ci.protocol == 'lora'),
        operation_setup: self.loadOperationSetup()
      };
      return {data: {options:generationOptions }};
    });
  }

  async createResourceManager(options) {
    const self = this;
    const {points, device_maps, resource_managers, operation_setup} = options;
    let tmp_points_correlation = {};
    let allPoints = [];
    await Promise.all(points.map(async (p) => {
      let tmp_id = p.id;
      delete p.id;
      p.id = '_' + Math.random().toString(36).substr(2, 9);
      let pointModel = await self.createPoint(p);
      tmp_points_correlation[tmp_id] = pointModel.id;
      allPoints.push(pointModel.id);
    }));
    let tmp_device_maps_correlation = {};
    await Promise.all(device_maps.map(async (dm) => {
      let rmcs = [];
      await Promise.all(dm.nodes.map(async (mc) => {
        mc.point_id = tmp_points_correlation[mc.point_id];
        mc.active = true;
        let microControlerModel = await self.createMicroControler(mc);
        rmcs.push({
          rmc_id: microControlerModel.id
        });
      }));
      dm.nodes = rmcs;
      let tmp_id = dm.id;
      delete dm.id;
      let deviceMapModel = await self.createDeviceMap(dm);
      tmp_device_maps_correlation[tmp_id] = deviceMapModel.id;
    }));
    let tmp_rms_correlation = {};
    let rms = await Promise.all(resource_managers.map(async (rm) => {
      let tmp_id = rm.id;
      delete rm.id;
      rm.device_map_id = tmp_device_maps_correlation[rm.device_map_id];
      rm.point_ids = allPoints;
      let resourceManagerModel = await self.createManager(rm);
      tmp_rms_correlation[tmp_id] = resourceManagerModel.id;
      return await self.initResourceManager(resourceManagerModel)
    }));
    return {
      rm: rms[0],
      data: {
        id: rms[0].id,
        tree: rms[0].deviceControler.tree,
        points: rms[0].points
      }
    }
  }

  getResourceManager(rmId){
    let rm = this.resourceManagers[rmId];
    return {
      rm: rm,
      data: {
        id: rm.id,
        tree: rm.deviceControler.tree,
        points: rm.points
      }
    }
  }

  async getRootMcDevicesData(rmId, rmcId, from, to){
    const self = this;
    let rm = self.getResourceManager(rmId).rm;
    let rmc = rm.deviceControler.getRootControler(rmcId);
    let devIds = rmc.devs.map((d) => d.id);
    return self.getDevicesData(rmId, devIds, from, to);
  }

  async getDevicesData(rmId, devIds, from, to){
    const self = this;
    let rm = self.getResourceManager(rmId).rm;
    let query = rm.dataHandler.generateQuery(devIds, from, to);
    let measurements = await rm.dataHandler.fetchData(Measurement, query);
    let events = await rm.dataHandler.fetchData(Event, query);
    return {data: {measurements: measurements, events: events}};
  }

  async getDeviceData(rmId, devId, from, to){
    const self = this;
    let rm = self.getResourceManager(rmId).rm;
    let query = rm.dataHandler.generateQuery([devId], from, to);
    let measurements = await rm.dataHandler.fetchData(Measurement, query);
    let events = await rm.dataHandler.fetchData(Event, query);
    return {data: {measurements: measurements, events: events}};
  }

  async createMcsAndInit(rmId, nodes){
    const self = this;
    let rm = self.getResourceManager(rmId).rm;
    return await rm.deviceControler.createMicroControlers(nodes).then(async (mcs)=>{
      let newMcs = mcs.map((mc) => {return {rmc_id:mc.id,mmc_ids:mc.mcs.map(mc=>mc.id)}});
      rm.deviceControler.deviceMap.nodes = rm.deviceControler.deviceMap.nodes.concat(newMcs);
      return await rm.deviceControler.buildHardwareAbstraction({nodes:newMcs}).then(()=>{
        return {data: {tree: rm.deviceControler.tree}};
      });
    })
  }

  async createMcAndInit(rmId, role, pointId, devGroup, ciId, active){
    const self = this;
    let rm = self.getResourceManager(rmId).rm;
    let nodes = [{role: role, point_id:pointId, dev_group:devGroup, ci_id: ciId, active: active}];
    return await rm.deviceControler.createMicroControlers(nodes).then(async (mcs)=>{
      let newMcs = mcs.map((mc) => {return {rmc_id:mc.id,mmc_ids:mc.mcs.map(mc=>mc.id)}});
      rm.deviceControler.deviceMap.nodes = rm.deviceControler.deviceMap.nodes.concat(newMcs);
      return await rm.deviceControler.buildHardwareAbstraction({nodes:newMcs}).then(()=>{
        return {data: {tree: rm.deviceControler.tree}};
      });
    })
  }

  async createActions(rmId, commands){
    const self = this;
    let rm = self.getResourceManager(rmId).rm;
    commands.forEach((c) => {
      let devId = c[0];
      let value = c[1];
      let timestamp = c[2];
      rm.decisionProcessor.createCommand('action', [
        rm.deviceControler.devices[devId]
      ], value, 'manual', timestamp)
    });
    return {data: {done:1}}
  }

  async createAction(rmId, devId, value, timestamp){
    const self = this;
    let rm = self.getResourceManager(rmId).rm;
    timestamp = timestamp || Date.now();
    rm.decisionProcessor.createCommand('action', [
      rm.deviceControler.devices[devId]
    ], value, 'manual', timestamp)
    return {data: {done:1}}
  }

  async createPoints(rmId, nodes){
    return {
      data: {
        points: await Promise.all(nodes.map(async (pointModelParams) => {
          return await Point.that(pointModelParams).then((point) => {
            return point;
          })
        }))
      }
    }
  }

  async createSolePoint(rmId, title, type, lat, lon) {
    return {
      data: {
        point: await Point.that({
          title: title,
          type: type,
          location: {
            coordinates: [lat, lon],
            type: "Point"
          }
        }).then((point) => {
          return point;
        })
      }
    }
  }
}

module.exports = Orchestrator;
