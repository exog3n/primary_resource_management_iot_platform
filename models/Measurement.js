
const mongoose = require('mongoose');

const { APIError } = require('../helpers');

const Schema = mongoose.Schema;

const measurementSchema = new Schema({
  id: String,
  value: String,
  timestamp: String,
  device_id: String,
  payload_id: String,
  data_specification: String
},{collection: 'measurements' });

measurementSchema.statics = {
  async createMeasurement(newMeasurement) {
    let measurement = {};
    const duplicate = await this.findOne({ id: newMeasurement.id });
    if (duplicate) {
      measurement = await this.updateMeasurement(newMeasurement.id, newMeasurement);
      return measurement;
    }
    measurement = await newMeasurement.save();
    return measurement.toObject();
  },
  async deleteMeasurement(id) {
    const deleted = await this.findOneAndRemove({ id });
    if (!deleted) {
      throw new APIError(404, 'Measurement Not Found', `No measurement '${id}' found.`);
    }
    return deleted.toObject();
  },
  async readMeasurement(id) {
    const measurement = await this.findOne({ id });

    if (!measurement) {
      throw new APIError(404, 'Measurement Not Found', `No measurement '${id}' found.`);
    }
    return measurement.toObject();
  },
  async readMeasurements(query, fields, skip, limit) {
    const measurements = await this.find(query, fields)
      .skip(skip)
      .limit(limit)
      .sort({ id: 1 })
      .exec();
    if (!measurements.length) {
      return [];
    }
    return measurements.map(measurement => measurement.toObject());
  },
  async updateMeasurement(id, measurementUpdate) {
    const measurement = await this.findOneAndUpdate({ id }, measurementUpdate, {
      new: true
    });
    if (!measurement) {
      throw new APIError(404, 'Measurement Not Found', `No measurement '${id}' found.`);
    }
    return measurement.toObject();
  }
};

if (!measurementSchema.options.toObject) measurementSchema.options.toObject = {};
measurementSchema.options.toObject.transform = (doc, ret) => {
  const transformed = ret;
  delete transformed._id;
  delete transformed.__v;
  return transformed;
};

measurementSchema.index({ id: 1, number: 1 }, { unique: true });

module.exports = mongoose.model('Measurement', measurementSchema);
