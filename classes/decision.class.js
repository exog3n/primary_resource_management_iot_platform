
class Decision{

  constructor(devices, source) {
    this.id = '_' + Math.random().toString(36).substr(2, 9);
    this.devices = devices || [];
    this.model_id = source;
  }


static async which (id) {
  const decision = await DecisionModel.readDecision(id);
  return decision;
}

async that (params) {
  await DecisionModel.createDecision(new DecisionModel(params))
}

async over (params) {
  const { id } = params;
  await DBDecisionModel.updateDecision(params);
}

async nomore (params) {
  const { id } = params;
  await DBDecisionModel.deleteDecision(id);
}
};
module.exports = Decision;
