// app imports
const { Event } = require('../models');
const { APIError } = require('../helpers');

/**
 * Validate the POST request body and create a new Event
 */
async function createEvent(request, response, next) {
  try {
    const newEvent = await Event.createEvent(new Event(request.body));
    console.log("created",newEvent)
    return response.status(201).json(newEvent);
  } catch (err) {
    return next(err);
  }
}

/**
 * Get a single event
 * @param {String} id - the id of the Event to retrieve
 */
async function readEvent(request, response, next) {
  const { id } = request.params;
  try {
    const event = await Event.readEvent(id);
    console.log("readed",newEvent)
    return response.json(event);
  } catch (err) {
    return next(err);
  }
}

/**
 * Update a single event
 * @param {String} id - the id of the Event to update
 */
async function updateEvent(request, response, next) {
  const { id } = request.params;
  try {
    const event = await Event.updateEvent(id, request.body);
    console.log("updated",newEvent)
    return response.json(event);
  } catch (err) {
    return next(err);
  }
}

/**
 * Remove a single event
 * @param {String} id - the id of the Event to remove
 */
async function deleteEvent(request, response, next) {
  const { id } = request.params;
  try {
    const deleteMsg = await Event.deleteEvent(id);
    console.log("deleted",newEvent)
    return response.json(deleteMsg);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createEvent,
  readEvent,
  updateEvent,
  deleteEvent
};
