/* eslint consistent-return: "off" */

const request = require('request-promise').defaults({
  simple: false,
  resolveWithFullResponse: true,
});
const CFM = require('@wice-devs/cfm');

// CFM Configuration
const cfm = new CFM();
const globalRules = {
  skipDuplicateEntry: 'myRule1',
};

// Configure rules
const rules = {
  rejectEmpty: ['title', 'birthday', 'middleName', 'salutation'],
  uniqArray: ['contactData.[]', 'addresses.[]'],
  copyNew: ['firstName', 'lastName', 'jobTitle', 'name', 'logo'],
  onlyOverwriteEmpty: ['gender', 'nickname'],
};

// Apply rules
cfm.setGlobalRules(globalRules);
cfm.setRules(rules);

const BASE_URI = 'https://api.snazzycontacts.com/api';

/**
 * @desc Check if the object alredy exists in Snazzy Contacts
 *
 * @access  Private
 * @param {Object} msg - the whole incoming object
 * @param {String} token - token from Snazzy Contacts
 * @return {Object} - the found object or false in case if it is not found
 */
async function checkForExistingObject(msg, token, type) {
  if (!token || !msg) {
    return false;
  }

  try {
    const options = {
      method: 'GET',
      uri: `${BASE_URI}/${type}/${msg.body.meta.uid}`,
      json: true,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await request(options);

    if (response === 'undefined'
        || response === undefined
        || response.statusCode !== 200) {
      return false;
    }

    return response.body;
  } catch (e) {
    console.log(`ERROR: ${e}`);
    return e;
  }
}

/**
 * @desc Resolve a conflict
 *
 * @access  Private
 * @param {Object} incomingObject - incoming object
 * @param {Object} appObject - target object
 * @return {Object} - the resolved objed
 */
function resolveConflict(incomingObject, appObject) {
  const resolved = cfm.resolve(incomingObject.body.data, appObject);
  return resolved;
}

/**
 * @desc Global resolve function
 *
 * @access  Private
 * @param {Object} msg - the whole incoming object
 * @param {String} token - token from Snazzy Contacts
 * @return {Object} - the resolved object and a boolean value if the object exists
 */
async function resolve(msg, token, type) {
  const appObject = await checkForExistingObject(msg, token, type);

  if (appObject) {
    const exists = true;
    const resolvedConflict = resolveConflict(msg, appObject);

    // In case of identical objects just return
    if ((Object.entries(resolvedConflict).length === 0
      && resolvedConflict.constructor === Object)
      || resolvedConflict === {}) {
      return;
    }

    return {
      resolvedConflict,
      exists,
    };
  }
  return false;
}

module.exports = {
  resolve,
  checkForExistingObject,
  resolveConflict,
};
