// app imports
const { Measurement } = require('../models');
const { APIError } = require('../helpers');

/**
 * Validate the POST request body and create a new Measurement
 */
async function createMeasurement(request, response, next) {
  try {
    const newMeasurement = await Measurement.createMeasurement(new Measurement(request.body));
    console.log("created",newMeasurement)
    return response.status(201).json(newMeasurement);
  } catch (err) {
    return next(err);
  }
}

/**
 * Get a single measurement
 * @param {String} id - the id of the Measurement to retrieve
 */
async function readMeasurement(request, response, next) {
  const { id } = request.params;
  try {
    const measurement = await Measurement.readMeasurement(id);
    console.log("readed",newMeasurement)
    return response.json(measurement);
  } catch (err) {
    return next(err);
  }
}

/**
 * Update a single measurement
 * @param {String} id - the id of the Measurement to update
 */
async function updateMeasurement(request, response, next) {
  const { id } = request.params;
  try {
    const measurement = await Measurement.updateMeasurement(id, request.body);
    console.log("updated",newMeasurement)
    return response.json(measurement);
  } catch (err) {
    return next(err);
  }
}

/**
 * Remove a single measurement
 * @param {String} id - the id of the Measurement to remove
 */
async function deleteMeasurement(request, response, next) {
  const { id } = request.params;
  try {
    const deleteMsg = await Measurement.deleteMeasurement(id);
    console.log("deleted",newMeasurement)
    return response.json(deleteMsg);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createMeasurement,
  readMeasurement,
  updateMeasurement,
  deleteMeasurement
};
