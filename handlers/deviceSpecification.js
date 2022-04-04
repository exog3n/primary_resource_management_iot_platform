// app imports
const { DeviceSpecification } = require('../models');
const { APIError } = require('../helpers');

/**
 * Validate the POST request body and create a new DeviceSpecification
 */
async function createDeviceSpecification(request, response, next) {
  try {
    const newDeviceSpecification = await DeviceSpecification.createDeviceSpecification(new DeviceSpecification(request.body));
    console.log("created",newDeviceSpecification)
    return response.status(201).json(newDeviceSpecification);
  } catch (err) {
    return next(err);
  }
}

/**
 * Get a single deviceSpecification
 * @param {String} id - the id of the DeviceSpecification to retrieve
 */
async function readDeviceSpecification(request, response, next) {
  const { id } = request.params;
  try {
    const deviceSpecification = await DeviceSpecification.readDeviceSpecification(id);
    console.log("readed",newDeviceSpecification)
    return response.json(deviceSpecification);
  } catch (err) {
    return next(err);
  }
}

/**
 * Update a single deviceSpecification
 * @param {String} id - the id of the DeviceSpecification to update
 */
async function updateDeviceSpecification(request, response, next) {
  const { id } = request.params;
  try {
    const deviceSpecification = await DeviceSpecification.updateDeviceSpecification(id, request.body);
    console.log("updated",newDeviceSpecification)
    return response.json(deviceSpecification);
  } catch (err) {
    return next(err);
  }
}

/**
 * Remove a single deviceSpecification
 * @param {String} id - the id of the DeviceSpecification to remove
 */
async function deleteDeviceSpecification(request, response, next) {
  const { id } = request.params;
  try {
    const deleteMsg = await DeviceSpecification.deleteDeviceSpecification(id);
    console.log("deleted",newDeviceSpecification)
    return response.json(deleteMsg);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createDeviceSpecification,
  readDeviceSpecification,
  updateDeviceSpecification,
  deleteDeviceSpecification
};
