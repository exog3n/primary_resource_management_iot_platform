const express = require('express');

class APIRouter {

  constructor(app, orchestrator, requestHandler) {
    this.app = app;
    this.o = orchestrator;
    this.requestHandler = requestHandler;
    this.routes = {
        '/api/device-groups':[
          {param:'',fn:'dev_groups'}
        ],
        '/api/device-specifications':[
          {param:'',fn:'dev_specs'}
        ],
        '/api/operation-setup':[
          {param:'',fn:'op_setup'}
        ],
        '/api/system-configuration':[
          {param:'',fn:'sys_config'},
          {param:'/:cmd',fn:'sys_config'}
        ],
        '/api/rm_data':[
          {param:'/rmId=:rmId',fn: 'rm_data'}
        ],
        '/api/mc_data':[
          {param:'/rmId=:rmId&mcId=:mcId&from=:from&to=:to',fn: 'mc_data'}
        ],
        '/api/mc_all_data':[
          {param:'/:rmId&:mcId',fn: 'mc_data'}
        ],
        '/api/dev_data':[
          {param:'/rmId=:rmId&devId=:devId&from=:from&to=:to',fn: 'dev_data'}
        ],
        '/api/payloads':[
          {param:'',fn: 'payloads'},
        ],
        '/api/point_add':[
          {param:'/rmId=:rmId&title=:title&type=:type&lat=:lat&lon=:lon',fn: 'point_add'}
        ],
        '/api/mc_add':[
          {param:'/rmId=:rmId&role=:role&pointId=:pointId&devGroup=:devGroup&ciId=:ciId&active=:active',fn: 'mc_add'}
        ],
        '/api/action_add':[
          {param:'/rmId=:rmId&devId=:devId&value=:value&timestamp=:timestamp',fn: 'action_add'}
        ],
      }
  }

  initRoutes(){
    const self = this;
    Object.keys(self.routes).forEach((path)=>{
      let br = self.routes[path];
      self.createRoute(path, br);
    })
  }

  createRoute(path, a){
    const router = new express.Router();
    a.forEach((handler)=>{
      let fn = this.requestHandler.onHttpRequest(this.requestHandler.handlers[handler.fn]);
      router.route(handler.param).get(fn)
    })
    this.app.use(path, router);
  }

};
module.exports = APIRouter;
