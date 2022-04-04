const { MicroControlerModel } = require('../models');

class MicroControler{

  constructor(id, role, microControlers, communicationInterface, devices, operationProfile, point, devGroup, active, alive, dependencies, subgroup) {
    this.id = id || '_' + Math.random().toString(36).substr(2, 9);
    this.role = role || null;
    this.mcs = microControlers || [];
    this.ci = communicationInterface || {};
    this.devs = devices || {};
    this.op = operationProfile;
    this.point = point || {};
    this.devGroup = devGroup || {};
    this.active = active || false;
    this.alive = alive || false;
    this.dependencies = dependencies;
    this.subgroup = subgroup || null;
    this.parent_mc_id = null;
  }

  async setOperationProfile(op){
    this.op = op;
    return this.over({id:this.id, op_id:this.op.id});
  }

  async setSubnetwork(mcs, save){
    this.mcs = {};
    mcs.forEach((mc)=>{
      this.mcs[mc.id] = mc;
    })
    if(save){
      this.over({id:this.id, mc_ids:mcs.map((mc) => mc.id)});
    }
  }

  isAlive(){
    this.alive = true;
  }

  isDead(){
    this.alive = false;
  }

  static async which (id) {
    const {role, ci_id, dev_ids, mc_ids, op_id, point_id, dev_group, active, alive, dependencies, subgroup} = await MicroControlerModel.readMicroControler(id);
    return new MicroControler(id, role, mc_ids, ci_id, dev_ids, op_id, point_id, dev_group, active, alive, dependencies, subgroup);
  }

  static async that (params) {
    params.id = '_' + Math.random().toString(36).substr(2, 9); // because when called in All promise making the same id
    let mcModel = await MicroControlerModel.createMicroControler(new MicroControlerModel(params));
    const {id, role, ci_id, dev_ids, mc_ids, op_id, point_id, dev_group, active, alive, dependencies, subgroup} = mcModel;
    return new MicroControler(id, role, mc_ids, ci_id, dev_ids, op_id, point_id, dev_group, active, alive, dependencies, subgroup);
  }

  async over (params) {
    const { id } = params;
    return await MicroControlerModel.updateMicroControler(id, params);
  }

  async nomore (params) {
    const { id } = params;
    await MicroControlerModel.deleteMicroControler(id);
  }

};
module.exports = MicroControler;
