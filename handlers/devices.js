// app imports
const { Device } = require('../models');
const { APIError, parseSkipLimit } = require('../helpers');

/**
 * List all the devices. Query params ?skip=0&limit=1000 by default
 */
async function readDevices(request, response, next) {
  /* pagination validation */
  let skip = parseSkipLimit(request.query.skip) || 0;
  let limit = parseSkipLimit(request.query.limit, 1000) || 1000;
  if (skip instanceof APIError) {
    return next(skip);
  } else if (limit instanceof APIError) {
    return next(limit);
  }

  try {
    const devices = await Device.readDevices({}, {}, skip, limit);
    return response.json(devices);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  readDevices
};
