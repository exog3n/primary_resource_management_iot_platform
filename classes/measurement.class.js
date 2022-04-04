const { MeasurementModel } = require('../models');

class Measurement{

  constructor(id, value, timestamp, device, payload_id, data_specification) {
    this.id = id || '_' + Math.random().toString(36).substr(2, 9);
    this.value = value;
    this.timestamp = timestamp;
    this.device = device || {};
    this.payload_id = payload_id;
    this.data_specification = data_specification || null;
  }

  static async which (id) {
    const measurement = await MeasurementModel.readMeasurement(id);
    return measurement;
  }

  static async that (object) {
    let {id, value, timestamp, device, payload_id, data_specification} = object;
    await MeasurementModel.createMeasurement(new MeasurementModel({id:id,value:value,timestamp:timestamp,device_id:device.id,payload_id:payload_id, data_specification:data_specification}))
  }

  async over (params) {
    const { id } = params;
    await MeasurementModel.updateMeasurement(params);
  }

  async nomore (params) {
    const { id } = params;
    await MeasurementModel.deleteMeasurement(id);
  }

  static async DBfind (query, fields) {
    return await MeasurementModel.readMeasurements(query, {}, 0, 1000).then(
      (data) => {
        return Object.values(data).map((d) => {
          let {id, value, timestamp, device_id, payload_id, data_specification} = d;
          return new Measurement(id, value, timestamp, device_id, payload_id, data_specification);
        })
      }
    );
  }

};
module.exports = Measurement;
