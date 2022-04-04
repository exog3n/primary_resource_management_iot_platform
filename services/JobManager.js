const schedule = require('node-schedule');

class JobManager{

  constructor() {
    this.jobs = [];
  }

  createDateSchedule(date, fn){
    const job = schedule.scheduleJob(date, async () => {
      fn.apply();
    });
    this.jobs.push(job);
  }

};
module.exports = JobManager;
