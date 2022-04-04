const { OperationProfileModel } = require('../models');

class OperationProfile{

  constructor(id, mcId, microControlerProfiles, communicationInterfaceProfiles, devicesProfiles, subnetworks) {
    this.id = id || '_' + Math.random().toString(36).substr(2, 9);
    this.mcId = mcId;
    this.mcs = microControlerProfiles || {};
    this.cis = communicationInterfaceProfiles || {};
    this.devs = devicesProfiles || {};
    this.subnetworks = subnetworks || {};
  }

static async which (id) {
  const {mc_id, mcs, cis, devs, subnetworks} = await OperationProfileModel.readOperationProfile(id);
  return new OperationProfile(id, mc_id, mcs, cis, devs, subnetworks);
}

async that (params) {
  await OperationProfileModel.createOperationProfile(new OperationProfileModel(params))
}

async over (params) {
  const { id } = params;
  await OperationProfileModel.updateOperationProfile(params);
}

async nomore (params) {
  const { id } = params;
  await OperationProfileModel.deleteOperationProfile(id);
}
};
module.exports = OperationProfile;
