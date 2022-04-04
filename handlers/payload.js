// app imports
const { Payload } = require('../models');
const { APIError } = require('../helpers');

/**
 * Validate the POST request body and create a new Payload
 */
async function createPayload(request, response, next) {
  try {
    const newPayload = await Payload.createPayload(new Payload(request.body));
    console.log("created",newPayload)
    return response.status(201).json(newPayload);
  } catch (err) {
    return next(err);
  }
}

/**
 * Get a single payload
 * @param {String} id - the id of the Payload to retrieve
 */
async function readPayload(request, response, next) {
  const { id } = request.params;
  try {
    const payload = await Payload.readPayload(id);
    console.log("readed",newPayload)
    return response.json(payload);
  } catch (err) {
    return next(err);
  }
}

/**
 * Update a single payload
 * @param {String} id - the id of the Payload to update
 */
async function updatePayload(request, response, next) {
  const { id } = request.params;
  try {
    const payload = await Payload.updatePayload(id, request.body);
    console.log("updated",newPayload)
    return response.json(payload);
  } catch (err) {
    return next(err);
  }
}

/**
 * Remove a single payload
 * @param {String} id - the id of the Payload to remove
 */
async function deletePayload(request, response, next) {
  const { id } = request.params;
  try {
    const deleteMsg = await Payload.deletePayload(id);
    console.log("deleted",newPayload)
    return response.json(deleteMsg);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createPayload,
  readPayload,
  updatePayload,
  deletePayload
};
