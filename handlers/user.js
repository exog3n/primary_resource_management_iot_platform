// app imports
const { User } = require('../models');
const { APIError } = require('../helpers');

/**
 * Validate the POST request body and create a new User
 */
async function createUser(request, response, next) {
  try {
    const newUser = await User.createUser(new User(request.body));
    console.log("created",newUser)
    return response.status(201).json(newUser);
  } catch (err) {
    return next(err);
  }
}

/**
 * Get a single user
 * @param {String} id - the id of the User to retrieve
 */
async function readUser(request, response, next) {
  const { id } = request.params;
  try {
    const user = await User.readUser(id);
    console.log("readed",newUser)
    return response.json(user);
  } catch (err) {
    return next(err);
  }
}

/**
 * Update a single user
 * @param {String} id - the id of the User to update
 */
async function updateUser(request, response, next) {
  const { id } = request.params;
  try {
    const user = await User.updateUser(id, request.body);
    console.log("updated",newUser)
    return response.json(user);
  } catch (err) {
    return next(err);
  }
}

/**
 * Remove a single user
 * @param {String} id - the id of the User to remove
 */
async function deleteUser(request, response, next) {
  const { id } = request.params;
  try {
    const deleteMsg = await User.deleteUser(id);
    console.log("deleted",newUser)
    return response.json(deleteMsg);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createUser,
  readUser,
  updateUser,
  deleteUser
};
