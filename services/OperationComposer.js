const OperationProfile = require('../classes/operationProfile.class');

class OperationComposer{
  constructor(rm) {
    this.rm = rm;
    this.config = rm.getSystemConfig() || {};
    this.setup = rm.getOperationSetup() || {};
    this.operationProfiles = {};
  }

  async initializeOperationProfiles(l){
    return await Promise.all(l.map(async (m) => {
      return await this.initializeOperationProfile(m);
    }))
  }

  async initializeOperationProfile(c){
      if (!c.op){
        let p = this.buildOperationProfile(c);
        c.setOperationProfile(p);
        return await p.that(p).then(()=> {
          return c;
        })
      } else if (typeof c.op === 'string' || c.op instanceof String){
        return await OperationProfile.which(c.op).then(async (p) => {
          c.setOperationProfile(p);
          return c;
        });
      }
  }

  buildOperationProfile(mc) {
    const self = this;
    const config = self.config;
    const setup = self.setup;
    let p = {};
    p['mcs'] = {};
    p['cis'] = {};
    p['subnetworks'] = {
      enum: [],
      devs: {}
    };
    p.cis['rciid'] = mc.ci.id;
    p.cis['enum'] = [];
    p['devs'] = {};
    Object.keys(mc.devs).forEach((d)=>{
      let dev = mc.devs[d];
      p.cis.enum.push(dev.id);
      let specs = config.specifications;
      let dt = Object.keys(specs).find((k) => {
        return specs[k] === dev.specification.type;
      });
      let task = mc.devGroup.task;
      p.devs[dev.id] = {};
      p.devs[dev.id]['io'] = dev.io;
      p.devs[dev.id][dev.role] = setup[task][dev.role][dt];
    });
    p.cis['options'] = {};
    p.cis.options['interval'] = 60
    let { mcs, cis, devs, subnetworks } = p;
    let i = new OperationProfile(null, mc.id, mcs, cis, devs, subnetworks);
    this.operationProfiles[i.id]=i;
    return i;
};

}

module.exports = OperationComposer;
