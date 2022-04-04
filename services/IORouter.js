const Downlink = require('../classes/downlink.class');
const Uplink = require('../classes/uplink.class');
const Join = require('../classes/join.class');
const CommunicationInterface = require('../classes/communicationInterface.class');
const ProtocolHandler = require('./ProtocolHandler');
const http = require('http');

class IORouter {

  constructor(rm) {
    this.rm = rm;
    this.protocolHandler = new ProtocolHandler(rm.systemConfig.communication.protocol, 'cloud');
  }

  enqueueCommand(cmd, item, rci){
    const self = this;
    let queue = rci.q;
    if(cmd=='action'){
      let j = 0;
      while ( j < rci.q.length && rci.q[j].timestamp < item.timestamp ) {j ++};
      queue.splice(j, 0, item);
      console.log('Action added to', rci.id, 'queue', item.id, new Date(item.timestamp))
    } else if (cmd=='operation_profile'){
      queue.push(item);
    }
    rci.q = queue;
    return queue;
  }

  triggerCommand(cmd, ci, rmc){
    const self = this;
    rmc = rmc || self.getControler(ci.mcId);
    let cmdsPerMsgLimit = 999;
    if(self.protocolHandler.settings.payloadType === "text"){
      cmdsPerMsgLimit = 6;
    }
    if(ci.hasQueue()){
      let fromTime, toTime = null;
      if(cmd == 'action'){
        fromTime = new Date();
        fromTime.setHours(0, 0, 0, 0);
        toTime = new Date();
        toTime.setDate(toTime.getDate() + 1);
        toTime.setHours(23, 59, 59, 999);
        fromTime = fromTime.getTime();
        toTime = toTime.getTime();
      }
      let items = ci.queueShift(cmdsPerMsgLimit, fromTime, toTime);
      if(items.length > 0){
        let isPart = (cmdsPerMsgLimit - items.length) == 0 && ci.q.length > 0;
        self.routeCommand(cmd, items, rmc, isPart);
      }
    }
  }

  routeCommand(cmd, items, rmc, isPart) {
    let timestamp = Date.now();
    let message = {};
    if (cmd == 'action') {
        let data = {events: items, type:'trigger', enumMethod: 'single', isPart: isPart, timestamp:timestamp};
        message = this.protocolHandler.encodeMessage(cmd, data, rmc.op);
    }
    this.createDownlink({peer:rmc.ci, data: message}, this.sendDownlink, timestamp);
  }

  createDownlink(message, sendCallback, timestamp){
    let peer = message.peer;
    let id = peer.id + '_' + timestamp;
    let downlink = new Downlink(id, message.data, timestamp, peer);
    sendCallback.call(this, downlink);
  }

  sendDownlink(downlink, forceDownlink) {
    if(this.protocolHandler.settings.payloadType === 'text' && downlink.message.text){
      downlink.message = Buffer.from(downlink.message.text).toString('base64'); // str message in base64 format
    }
    let payload = forceDownlink || {
      appId: this.rm.networkId,
      devId: downlink.ci.id,
      frmPayload: downlink.message
    };
    let url = "/api/v3/as/applications/"+payload.appId+"/webhooks/payloads/devices/"+payload.devId+"/down/push";
    let data = '{"downlinks":[{"frm_payload":"'+ payload.frmPayload +'","f_port":41,"priority":"NORMAL"}]}';
    const options = {
        hostname: this.config.communication.ttsIp,
        port:1885,
        path: url,
        method: 'POST',
        headers: {
          'Authorization': this.config.communication.ttsBearer,
        }
    };
    const req = http.request(options, (res) => {
        res.on('data', (chunk) => {
            console.log(`BODY: ${chunk}`);
        });
        res.on('end', () => {
          Downlink.that(downlink);
        });
    });
    req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
    });
    req.write(data);
    req.end();
  }

  gatherUplink(id, raw, b64, time, ci, info) {
    const self = this;
    let rmc = self.getRootControler(ci.mcId);
    let uplinkData = null;
    if(self.protocolHandler.settings.payloadType === 'text'){
      console.log('Raw message from', ci.id, raw);
      uplinkData = self.protocolHandler.decode(raw, rmc.op);
    }
    let uplink = new Uplink(id, raw, time, ci, uplinkData.blocks, uplinkData.cmd, info);
    Uplink.that(uplink);
    return uplink;
  }

  gatherJoin(id, time, ci, info) {
    const self = this;
    let rmc = self.getRootControler(ci.mcId);
    let join = new Join(id, time, ci, info);
    Join.that(join);
    return join;
  }

};
module.exports = IORouter;
