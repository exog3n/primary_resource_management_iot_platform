// app imports
const { Point } = require('../models');
const { APIError } = require('../helpers');

/**
 * Validate the POST request body and create a new Point
 */
async function createPoint(request, response, next) {
  try {
    const newPoint = await Point.createPoint(new Point(request.body));
    console.log("created",newPoint)
    return response.status(201).json(newPoint);
  } catch (err) {
    return next(err);
  }
}

/**
 * Get a single point
 * @param {String} id - the id of the Point to retrieve
 */
async function readPoint(request, response, next) {
  const { id } = request.params;
  try {
    const point = await Point.readPoint(id);
    console.log("readed",newPoint)
    return response.json(point);
  } catch (err) {
    return next(err);
  }
}

/**
 * Update a single point
 * @param {String} id - the id of the Point to update
 */
async function updatePoint(request, response, next) {
  const { id } = request.params;
  try {
    const point = await Point.updatePoint(id, request.body);
    console.log("updated",newPoint)
    return response.json(point);
  } catch (err) {
    return next(err);
  }
}

/**
 * Remove a single point
 * @param {String} id - the id of the Point to remove
 */
async function deletePoint(request, response, next) {
  const { id } = request.params;
  try {
    const deleteMsg = await Point.deletePoint(id);
    console.log("deleted",newPoint)
    return response.json(deleteMsg);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createPoint,
  readPoint,
  updatePoint,
  deletePoint
};
