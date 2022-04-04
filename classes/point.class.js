const { PointModel } = require('../models');

class Point{

  constructor(id, type, title, location, root, parent, childrens, ci, controler) {
    this.id = id || '_' + Math.random().toString(36).substr(2, 9);
    this.type = type;
    this.title = title;
    this.location = location || {};
    this.root = root || {};
    this.parent = parent || {};
    this.childrens = childrens || [];
  }

  static async which (id) {
    const {type, title, location,root_point_id,parent_id,children_ids,interface_id,controler_id} = await PointModel.readPoint(id);
    return new Point(id, type, title,location,root_point_id,parent_id,children_ids,interface_id,controler_id); // TODO see what to do with these ids
  }

  static async that (params) {
    let point = await PointModel.createPoint(new PointModel(params));
    return point;
  }

  async over (params) {
    const { id } = params;
    await PointModel.updatePoint(params);
  }

  async nomore (params) {
    const { id } = params;
    await PointModel.deletePoint(id);
  }

};
module.exports = Point;
