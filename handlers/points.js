// app imports
const { Point } = require('../models');
const { APIError, parseSkipLimit } = require('../helpers');

/**
 * List all the points. Query params ?skip=0&limit=1000 by default
 */
async function readPoints(request, response, next) {
  /* pagination validation */
  let skip = parseSkipLimit(request.query.skip) || 0;
  let limit = parseSkipLimit(request.query.limit, 1000) || 1000;
  if (skip instanceof APIError) {
    return next(skip);
  } else if (limit instanceof APIError) {
    return next(limit);
  }

  try {
    const points = await Point.readPoints({}, {}, skip, limit);
    return response.json(points);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  readPoints
};
