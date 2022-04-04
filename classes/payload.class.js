const { PayloadModel } = require('../models');

class Payload{
  constructor(id, message, timestamp, ci, type, command) {
    this.id = id;
    this.message = message || {};
    this.timestamp = timestamp;
    this.ci = ci || {};
    this.type = type;
    this.command = command;
  }

  static async which (id) {
    const payload = await PayloadModel.readPayload(id);
    return payload;
  }

  static async that (object) {
    object['ci_id'] = object.ci.id;
    delete object.ci;
    await PayloadModel.createPayload(new PayloadModel(object))
  }

  async over (params) {
    const { id } = params;
    await PayloadModel.updatePayload(params);
  }

  async nomore (params) {
    const { id } = params;
    await PayloadModel.deletePayload(id);
  }

};

module.exports = Payload;
