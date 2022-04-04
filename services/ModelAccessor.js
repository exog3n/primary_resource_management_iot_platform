const {ResourceManagerModel, DeviceMapModel, DeviceSpecificationModel, RecipeModel, DeviceGroupModel} = require('../models');
const {PointModel, DeviceModel, PayloadModel, DecisionModel, CommunicationInterfaceModel} = require('../models');
const {MicroControlerModel, OperationProfileModel, MeasurementModel, EventModel, UserModel } = require('../models');
const Point = require('../classes/point.class');
const MicroControler = require('../classes/microControler.class');
const systemOptions = require('../data/system.json'); // admin level configuration file

class ModelAccessor{

  constructor(){
  }

  async loadManagers(){
    return await ResourceManagerModel.readResourceManagers({}, {}, 0, 1000);
  }

  async createManager(data){
    return await ResourceManagerModel.createResourceManager(new ResourceManagerModel(data));
  }

  async loadDeviceSpecifications(){
    let devSpecs = await DeviceSpecificationModel.readDeviceSpecifications({}, {}, 0, 1000);
    return devSpecs;
  }

  async loadDeviceGroups(){
    let devGroups = await DeviceGroupModel.readDeviceGroups({}, {}, 0, 1000);
    return devGroups;
  }

  async loadPayloads(){
    let payloads = await PayloadModel.readPayloads({}, {}, 0, 1000);
    return payloads;
  }

  async loadDeviceSpecification(id){
    return await DeviceSpecificationModel.readDeviceSpecification(id);
  }

  async loadDeviceMap(id){
    return await DeviceMapModel.readDeviceMap(id);
  }

  async createDeviceMap(data){
    return await DeviceMapModel.createDeviceMap(new DeviceMapModel(data));
  }

  async createPoint(data){
    return await Point.that(data);
  }

  async createMicroControler(data){
    return await MicroControler.that(data);
  }

  async loadRecipe(id){
    return await RecipeModel.readRecipe(id);
  }

  async loadRecipes(){
    return await RecipeModel.readRecipes({}, {}, 0, 1000);
  }

  async loadCommunicationinterfaces(){
    return await CommunicationInterfaceModel.readCommunicationInterfaces({}, {}, 0, 1000);
  }

  async loadDefaultOptions(){
    return Promise.all([
      ModelAccessor.prototype.loadRecipes(),
      ModelAccessor.prototype.loadDeviceGroups(),
      ModelAccessor.prototype.loadCommunicationinterfaces()
    ]);
  }

  loadSystemConfiguration(cmd){
    if(cmd == 'protocol'){
      return systemOptions.system_config.communication.protocol;
    }
    return systemOptions.system_config;
  }

  loadOperationSetup(){
    return systemOptions.operation_setup;
  }

  static async restoreDB(data){
    Object.keys(data).forEach((collection)=>{
      data[collection].forEach((d)=>{
        if(collection == 'communication_interfaces'){
            CommunicationInterfaceModel.createCommunicationInterface(new CommunicationInterfaceModel(d));
        }
        if(collection == 'points'){
            PointModel.createPoint(new PointModel(d));
        }
        if(collection == 'device_specifications'){
            DeviceSpecificationModel.createDeviceSpecification(new DeviceSpecificationModel(d));
        }
        if(collection == 'micro_controlers'){
            MicroControlerModel.createMicroControler(new MicroControlerModel(d));
        }
        if(collection == 'device_groups'){
            DeviceGroupModel.createDeviceGroup(new DeviceGroupModel(d));
        }
        if(collection == 'device_maps'){
            DeviceMapModel.createDeviceMap(new DeviceMapModel(d));
        }
        if(collection == 'resource_managers'){
            ResourceManagerModel.createResourceManager(new ResourceManagerModel(d));
        }
        if(collection == 'devices'){
            DeviceModel.createDevice(new DeviceModel(d));
        }
        if(collection == 'measurements'){
            MeasurementModel.createMeasurement(new MeasurementModel(d));
        }
      })
      console.log("Collections iteration completed!")
    })
  }

};
module.exports = ModelAccessor;
