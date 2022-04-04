const mongoose = require('mongoose');

const { APIError } = require('../helpers');

const Schema = mongoose.Schema;

const operationProfileSchema = new Schema({
  id: {type:String, default:'_' + Math.random().toString(36).substr(2, 9)},
  mc_id: String,
  mcs: Object,
  cis: {
    rciid: String,
    enum: [String],
    options: {
      interval: Number,
    }
  },
  devs: Object,
  subnetworks: {
    enum: Array,
    devs: Object
  }
},{collection: 'operation_profiles' });

operationProfileSchema.statics = {
  async createOperationProfile(newOperationProfile) {
    let operationProfile = {};
    const duplicate = await this.findOne({ id: newOperationProfile.id });
    if (duplicate) {
      operationProfile = await this.updateOperationProfile(newOperationProfile.id, newOperationProfile);
      return operationProfile;
    }
    operationProfile = await newOperationProfile.save();
    return operationProfile.toObject();
  },
  async deleteOperationProfile(id) {
    const deleted = await this.findOneAndRemove({ id });
    if (!deleted) {
      throw new APIError(404, 'OperationProfile Not Found', `No operationProfile '${id}' found.`);
    }
    return deleted.toObject();
  },
  async readOperationProfile(id) {
    const operationProfile = await this.findOne({ id });

    if (!operationProfile) {
      throw new APIError(404, 'OperationProfile Not Found', `No operationProfile '${id}' found.`);
    }
    return operationProfile.toObject();
  },
  async readOperationProfiles(query, fields, skip, limit) {
    const operationProfiles = await this.find(query, fields)
      .skip(skip)
      .limit(limit)
      .sort({ id: 1 })
      .exec();
    if (!operationProfiles.length) {
      return [];
    }
    return operationProfiles.map(operationProfile => operationProfile.toObject());
  },
  async updateOperationProfile(id, operationProfileUpdate) {
    const operationProfile = await this.findOneAndUpdate({ id }, operationProfileUpdate, {
      new: true
    });
    if (!operationProfile) {
      throw new APIError(404, 'OperationProfile Not Found', `No operationProfile '${id}' found.`);
    }
    return operationProfile.toObject();
  }
};

if (!operationProfileSchema.options.toObject) operationProfileSchema.options.toObject = {};
operationProfileSchema.options.toObject.transform = (doc, ret) => {
  const transformed = ret;
  delete transformed._id;
  delete transformed.__v;
  return transformed;
};

operationProfileSchema.index({ id: 1, number: 1 }, { unique: true });

module.exports = mongoose.model('OperationProfile', operationProfileSchema);
