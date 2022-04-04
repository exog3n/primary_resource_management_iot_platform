
class NetworkGateway {
  constructor(app) {
    this.app = app;
    this.webhooks = {};
  }

  listen(orchestrator, systemCallback) {
    const self = this;
    const bodyParser = require("body-parser")
    self.app.use(bodyParser.json())
    console.log('NetworkGateway start listening TTS webhooks...');
    self.app.post("/uplinks", (req, res) => {
      console.log('TTS: Uplink succesfully received from ci:', req.body.end_device_ids.device_id) // Call your action on the request here
      try{systemCallback.apply(orchestrator,[req.body,'uplink']);}catch(e){console.log(e)}
    });
    self.app.post("/joins", (req, res) => {
      console.log('TTS: Ci joined:', req.body.end_device_ids.device_id);
      try{systemCallback.apply(orchestrator,[req.body,'join']);}catch(e){console.log(e)}
    });
    self.app.post("/downlinks/sent", (req, res) => {
      console.log('TTS: Downlink succesfully sent to ci:', req.body.end_device_ids.device_id)
    });
    self.app.post("/downlinks/queue", (req, res) => {
      console.log('TTS: Downlink succesfully queued for ci:', req.body.end_device_ids.device_id)
    });
    self.app.post("/downlinks/join", (req, res) => {
      console.log('TTS: Downlink succesfully joined from ci:', req.body.end_device_ids.device_id)
    });
  }

};
module.exports = NetworkGateway;
