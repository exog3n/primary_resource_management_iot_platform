const { EventModel } = require('../models');

class Event{

  constructor(value, timestamp, device, action_id, payload_id) {
    this.id = '_' + Math.random().toString(36).substr(2, 9);
    this.value = value;
    this.timestamp = timestamp;
    this.device = device || {};
    this.action_id = action_id || null;
    this.payload_id = payload_id;
    this.condition = 'pending';
  }

  static async which (id) {
    const evnt = await EventModel.readEvent(id);
    return evnt;
  }

  static async that (object) {
    const {id,value,timestamp,device,condition} = object;
    await EventModel.createEvent(new EventModel({id:id,value:value,timestamp:timestamp,device_id:device.id,condition:condition}))
  }

  async over (params) {
    const { id } = params;
    await EventModel.updateEvent(params);
  }

  async nomore (params) {
    const { id } = params;
    await EventModel.deleteEvent(id);
  }

};
module.exports = Event;
