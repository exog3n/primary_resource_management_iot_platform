const Payload = require('./payload.class.js');

class Uplink extends Payload {

  constructor(id, message, timestamp, ci, data, command, info){
    super(id, message, timestamp, ci, 'uplink', command);
    this.data = data;
    this.f_cnt = info.f_cnt;
    this.f_port = info.f_port;
    this.frm_payload = info.frm_payload;
    this.gw_id = info.gw_id;
    this.rssi = info.rssi;
    this.snr = info.snr;
    this.channel_index = info.channel_index;
    this.channel_rssi = info.channel_rssi;
    this.spreading_factor = info.spreading_factor;
    this.bandwidth = info.bandwidth;
    this.data_rate_index = info.data_rate_index;
    this.coding_rate = info.coding_rate;
    this.frequency = info.frequency;
    this.toa = info.toa;
  }

};
module.exports = Uplink;
