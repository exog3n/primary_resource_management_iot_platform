
class ProtocolHandler{

  constructor(settings, env) {
    this.settings = settings || {};
    this.env = env;
  }

  encodeMessage(cmd, data, op){
    let message = {};
    if(this.settings.payloadType === 'text'){
      if(cmd == 'action'){
        message.text = this.settings.flags[cmd] + this.encodeActions(data);
      }
      else if(cmd == 'continue'){
        message.text = this.settings.flags[cmd];
      }
      else {
        console.error('ERROR', 'Text encoding failed.');
      }
    }
    return message;
  }

  encodeEpoch(timestamp){
    return (timestamp) ? Math.round(timestamp / 1000) : '';
  }

  encodeActions(data){
    const self = this;
    let {events, type, enumMethod, isPart, timestamp} = data;
    let msgBlocks = [];
    events.forEach((n)=>{
      let deviceBlock = [];
      let dev = n.device;
      let eventValue = self.settings.flags[n.value];
      let actionType = self.settings.flags[type];
      let deviceIndex = data.index;
      let routeBlock = self.buildRouteBlock([deviceIndex]);
      deviceBlock = deviceBlock.concat([self.settings.flags['single']],routeBlock);
      let valueBlock = self.buildValueBlock([eventValue], actionType);
      deviceBlock = deviceBlock.concat(valueBlock);
      let timeBlock = self.buildTimeBlock(timestamp, n.timestamp);
      deviceBlock = deviceBlock.concat([self.settings.flags['date']],timeBlock);
      msgBlocks = msgBlocks.concat(deviceBlock);
    })
    if(isPart){
      msgBlocks.push(self.settings.flags.continue)
    }
    if(timestamp){
      msgBlocks.unshift(self.buildTimeBlock(timestamp));
    }
    return msgBlocks.join('');
  }


  decode(message, op){
    const self = this;
    if(self.settings.payloadType === 'text'){
      let blocks = [];
      let isPart = false;
      let msgParts = [];
      let cmd = message[0];
      let commandStr = Object.keys(self.settings.flags).find(fl => this.settings.flags[fl] === cmd);
      message = message.substr(1);
      if(message.length == 0){
        console.error('WARNING', 'There is only the initial flag on the message.', message);
        return {blocks:blocks, cmd:commandStr , isPart:isPart};
      }
      isPart = message[message.length - 1] == this.settings.flags['continue'];
      if(isPart){
        message = message.slice(0, -1);
      }
      if(message[0] == this.settings.flags['forward']){
        message = message.substr(1);
        blocks = blocks.concat(this.decodeParts(cmd, message ,this.settings.flags.single_block_separator));
      } else {
        msgParts = message.split(this.settings.flags['forward']).filter(Boolean);
        let separator = (cmd == this.settings.flags['action']) ? this.settings.flags.single_block_separator : this.settings.flags.standard_block_separator;
        blocks = blocks.concat(this.decodeParts(cmd, msgParts[0] ,separator));
        if(msgParts[1]){
          blocks = blocks.concat(this.decodeParts(cmd, msgParts[1] ,this.settings.flags.single_block_separator));
        }
      }
      if(self.env === 'cloud'){
        blocks.forEach(d => {
          d[0] = op.cis.enum[d[0]]
        })
      }
      return {blocks:blocks, cmd:commandStr , isPart:isPart};
    }
  }

  decodeParts(cmd, message, separator){
    let blocks = [];
    let parts = message.split(separator).filter(Boolean);
    let epoch = null;
    if(parts[0].length == 10){
      epoch = parts[0];
      parts.shift();
    }
    for (let i = 0; i < parts.length; i++) {
      let part = parts[i];
      let deviceBlock = this.decodeDeviceBlock(part, cmd, epoch);
      if(deviceBlock){
        blocks.push(deviceBlock);
      }
    }
    return blocks;
  }

  decodeDeviceBlock(part, cmd, epoch){
    let contents = [];
    let routeBlock, valueBlock = [];
    if(cmd==this.settings.flags['action']){
      contents = part.split(this.settings.flags['trigger']);
      routeBlock = contents[0];
      if(contents[1].includes(this.settings.flags['date'])){
        let subContents = contents[1].split(this.settings.flags['date']);
        valueBlock[0] = subContents[0];
        valueBlock[1] = this.decodeTime(epoch, subContents[1]);
      } else {
        valueBlock = contents.slice(1);
      }
    }
    if(cmd==this.settings.flags['operation_profile']){
      if (part.includes(this.settings.flags['instruction'])) {
        contents = part.split(this.settings.flags['instruction']);
        routeBlock = contents[0];
        valueBlock = contents.slice(1);
      } else {
        routeBlock = part;
      }
    }
    if(cmd==this.settings.flags['report']){
      let reportFlags = this.settings.flags['measurement'] + this.settings.flags['event'];
      contents = part.split(part.match(new RegExp("([\d.]+)?[" + reportFlags + "]","g"))[0]);
      routeBlock = contents[0];
      if(contents[1].includes(this.settings.flags['date'])){
        let subContents = contents[1].split(this.settings.flags['date']);
        valueBlock[0] = subContents[0];
        valueBlock[1] = this.decodeTime(epoch, subContents[1]);
      } else {
        valueBlock = contents.slice(1);
      }
    }
    return [routeBlock,valueBlock];
  }

  decodeTime(epochSecondsTime, diffMinutesTime){
    if(diffMinutesTime){
      let diffSecondsTime = Number(diffMinutesTime) * 60;
      let toSecondsTime = Number(epochSecondsTime) + diffSecondsTime;
      return toSecondsTime * 1000;
    }
    return Number(epochSecondsTime) * 1000;
  }

  buildValueBlock(values, flag){
    let block = [];
    for (let i = 0 ; i < values.length ; i++){
      if(flag){
        block.push(flag);
      }
      block.push(values[i]);
    }
    return block;
  }

  buildRouteBlock(ids){
    let block = [];
    for (let i = 0 ; i < ids.length ; i++){
      block.push(ids[i]);
      if(i < ids.length - 1){
        block.push('_');
      }
    }
    return block;
  }

  buildTimeBlock(epochTime, toTime){
    let epochSecondsTime = Math.round(epochTime / 1000);
    if(toTime){
      let toSecondsTime = Math.round(toTime / 1000);
      let diffSecondsTime = toSecondsTime - epochSecondsTime;
      let diffMinutesTime = Math.round(diffSecondsTime / 60);
      return diffMinutesTime;
    }
    return epochSecondsTime;
  }

};
module.exports = ProtocolHandler;
