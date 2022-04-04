const Action = require('../classes/action.class');
const Event = require('../classes/event.class');

class DecisionProcessor{

  constructor(rm, parser, jobManager) {
    this.rm = rm;
    this.parser = parser;
    this.jobManager = jobManager;
  }

  createCommand(ct, map, e, ou, t){
    if(ct == 'action'){
      let pos = t || Date.now();
      let act = new Action(map, 'trigger', ou, pos);
      let es = map.map((dev) => new Event(e, pos, dev, act.id));
        this.rm.deviceControler.setAction(es, action);
    }
  }

};
module.exports = DecisionProcessor;
