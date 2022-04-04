const mongoose = require('mongoose');

const { APIError } = require('../helpers');

const Schema = mongoose.Schema;

const resourceManagerSchema = new Schema({
  id: {type:String, default:'_' + Math.random().toString(36).substr(2, 9)},
  network_id: String,
  user_ids: [String],
  point_ids: [String],
  device_map_id: String
},{collection: 'resource_managers' });

resourceManagerSchema.statics = {
  async createResourceManager(newResourceManager) {
    let resourceManager = {};
    const duplicate = await this.findOne({ id: newResourceManager.id });
    if (duplicate) {
      resourceManager = await this.updateResourceManager(newResourceManager.id, newResourceManager);
      return resourceManager;
    }
    resourceManager = await newResourceManager.save();
    return resourceManager.toObject();
  },
  async deleteResourceManager(id) {
    const deleted = await this.findOneAndRemove({ id });
    if (!deleted) {
      throw new APIError(404, 'ResourceManager Not Found', `No resourceManager '${id}' found.`);
    }
    return deleted.toObject();
  },
  async readResourceManager(id) {
    const resourceManager = await this.findOne({ id });

    if (!resourceManager) {
      throw new APIError(404, 'ResourceManager Not Found', `No resourceManager '${id}' found.`);
    }
    return resourceManager.toObject();
  },
  async readResourceManagers(query, fields, skip, limit) {
    const resourceManagers = await this.find(query, fields)
      .skip(skip)
      .limit(limit)
      .sort({ id: 1 })
      .exec();
    if (!resourceManagers.length) {
      return [];
    }
    return resourceManagers.map(resourceManager => resourceManager.toObject());
  },
  async updateResourceManager(id, resourceManagerUpdate) {
    const resourceManager = await this.findOneAndUpdate({ id }, resourceManagerUpdate, {
      new: true
    });
    if (!resourceManager) {
      throw new APIError(404, 'ResourceManager Not Found', `No resourceManager '${id}' found.`);
    }
    return resourceManager.toObject();
  }
};

if (!resourceManagerSchema.options.toObject) resourceManagerSchema.options.toObject = {};
resourceManagerSchema.options.toObject.transform = (doc, ret) => {
  const transformed = ret;
  delete transformed._id;
  delete transformed.__v;
  return transformed;
};

resourceManagerSchema.index({ id: 1, number: 1 }, { unique: true });

module.exports = mongoose.model('ResourceManager', resourceManagerSchema);
