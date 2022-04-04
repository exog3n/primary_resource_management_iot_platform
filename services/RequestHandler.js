const { APIError, parseSkipLimit } = require('../helpers');
const Measurement = require('../classes/measurement.class');
const { deviceGroupsHandler, deviceSpecificationsHandler} = require('../handlers');
const { readDeviceGroups } = deviceGroupsHandler;
const { readDeviceSpecifications } = deviceSpecificationsHandler;
const { DeviceGroupModel } = require('../models');
class RequestHandler {

  constructor(app, orchestrator) {
    this.app = app;
    this.o = orchestrator;
  }

  initHandlers(){
    const self = this;
    const orchestrator = self.o;
    self.handlers = {
      rm_data: orchestrator.getResourceManager,
      rm_gen: orchestrator.generateResourceManagerOptions,
      rm_add: orchestrator.createResourceManager,
      points_add: orchestrator.createPoints,
      point_add: orchestrator.createSolePoint,
      mcs_add: orchestrator.createMcsAndInit,
      mc_add: orchestrator.createMcAndInit,
      mc_data: orchestrator.getRootMcDevicesData,
      dev_data: orchestrator.getDeviceData,
      devs_data: orchestrator.getDevicesData,
      actions_add: orchestrator.createActions,
      action_add: orchestrator.createAction,
      dev_groups: orchestrator.loadDeviceGroups,
      dev_specs: orchestrator.loadDeviceSpecifications,
      payloads: orchestrator.loadPayloads,
      op_setup: orchestrator.loadOperationSetup,
      sys_config: orchestrator.loadSystemConfiguration
    }
    return self.handlers;
  }

  onHttpRequest(fn){
    const self = this;
    return async function (request, response, next) {
      console.log('API request', request.params);
      let skip = parseSkipLimit(request.query.skip) || 0;
      let limit = parseSkipLimit(request.query.limit, 1000) || 1000;
      if (skip instanceof APIError) {
        return next(skip);
      } else if (limit instanceof APIError) {
        return next(limit);
      }

      try {
        let params = Object.values(request.params);
        let result = await fn.apply(self.o, params);
        if(result.data){
          return response.json(result.data);
        }
        return response.json(result);
      } catch (err) {
        console.log(err)
        return next(err);
      }
    }
  }

  onWsRequest(fn){
    const self = this;
    return async function (request){
      return await fn.apply(self.o, Object.values(request))
    }
  }

};
module.exports = RequestHandler;
