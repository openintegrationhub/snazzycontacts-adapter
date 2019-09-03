const request = require('request-promise');
const CFM = require('@wice-devs/cfm');

const cfm = new CFM();
const globalRules = {
  skipDuplicateEntry: 'myRule1',
};
const rules = {
  rejectEmpty: ['title', 'birthday', 'middleName', 'jobTitle'],
  uniqArray: ['contactData.[]', 'addresses.[]'],
  copyNew: ['firstName', 'lastName', 'salutation'],
  onlyOverwriteEmpty: ['gender', 'nickname'],
};

cfm.setGlobalRules(globalRules);
cfm.setRules(rules);

const SNAZZY_URI = 'https://api.snazzycontacts.com/api/person';

/**
 * @desc Check if the object alredy exists in Snazzy Contacts
 *
 * @access  Private
 * @param {Object} msg - the whole incoming object
 * @param {String} token - token from Snazzy Contacts
 * @return {Object} - the found object or false in case if it is not found
 */
async function checkForExistingObject(msg, token) {
  if (!token || !msg) {
    return false;
  }

  try {
    const options = {
      method: 'GET',
      uri: `${SNAZZY_URI}/${msg.body.uid}`,
      json: true,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await request(options);

    if (response === 'undefined' || response === undefined) {
      return false;
    }

    // if ((Object.entries(response).length === 0 && response.constructor === Object)
    // || response.statusCode === 204
    // || response.statusCode === 401
    // || response.statusCode === 400
    // || !response
    // || response === 'undefined'
    // || response === undefined
    // ) {
    //   console.log('BOOM');
    //   return false;
    // }

    return response;
  } catch (e) {
    console.log(`ERROR: ${e}`);
    return e;
    // throw new Error(e);
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
  const resolved = cfm.resolve(incomingObject.body, appObject);
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
async function resolve(msg, token) {
  const appObject = await checkForExistingObject(msg, token);

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