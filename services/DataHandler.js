const Measurement = require('../classes/measurement.class');
const Event = require('../classes/event.class');
const Sensor = require('../classes/sensor.class');
const Actuator = require('../classes/actuator.class');

class DataHandler {
  constructor(rm) {
    this.rm = rm;
  }

  gatherReportsFromDevices(uplink, t){
    let relation = uplink.data;
    let data = [];
    relation.forEach((ud) => {
      if(!ud[0]){
        return;
      }
      let dev = this.rm.deviceControler.getDevice(ud[0]);
      let dd = ud[1][0];
      if(ud[1][0].split){
        dd = ud[1][0].split(';');
      }
      for (let i=0 ; i < dd.length ; i++){
        let specific = dev.specification.store[i];
        let co = dd[i];
        t = ud[1][1] || t;
        let d = null;
        if (dev instanceof Sensor) {
          d = new Measurement(null, co, t, dev, uplink.id, specific);
        }
        else if (dev instanceof Actuator) {
          d = new Event(co, t, dev, null, uplink.id, specific);
        }
        data.push(d);
      }
    })
    return data;
  }

  storeData(data) {
    data.forEach((d) => {
      if (d instanceof Measurement) {
        Measurement.that(d);
      }
      else if (d instanceof Event) {
        Event.that(d);
      }
    });
  }

  async fetchData(dataClass, query) {
    return await dataClass.DBfind(query).then((results)=>{
        return results;
    });
  }

  generateQuery(ids, from, to){
    if(!ids){
      return {};
    }
    let queryIds = ids.map((id) => { return {device_id:id}});
    from = from || 0;
    to = to || Date.now()
    return {
      $and: [{
          $or: queryIds
        },
        {
          timestamp: {
            $gt: from
          }
        },
        {
          timestamp: {
            $lt: to
          }
        }
      ]
    }
  }

};
module.exports = DataHandler;
