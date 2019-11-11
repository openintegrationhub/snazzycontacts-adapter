const request = require('request-promise').defaults({ simple: false, resolveWithFullResponse: true });

const BASE_URI = 'https://api.snazzycontacts.com/api';

/**
 * This method fetches persons or organizations from Snazzy Contacts
 *
 * @param options - request options
 * @param snapshot - current state of snapshot
 * @return {Object} - Array of person objects containing data and meta
 */
async function fetchAll(options, snapshot) {
  try {
    const result = [];
    const entries = await request.get(options);

    if (Object.entries(entries.body).length === 0 && entries.body.constructor === Object) {
      return false;
    }
    entries.body.data.filter((person) => {
      // Push only this objects which were updated after last function call
      if (person.lastUpdate > snapshot.lastUpdated) {
        return result.push(person);
      }
      return person;
    });

    // Sort the objects by lastUpdate
    result.sort((a, b) => parseInt(a.lastUpdate, 10) - parseInt(b.lastUpdate, 10));
    return {
      result,
      count: entries.body.meta.count,
    };
  } catch (e) {
    throw new Error(e);
  }
}

/**
 * @desc Prepares a DTO object for updating
 *
 * @access  Private
 * @param {Object} msg - the whole incoming object
 * @param {String} type - either 'person 'or 'organization'
 * @return {Object} - a new DTO object
 */
function prepareObject(msg, type) {
  let newObject;
  if (type === 'person') {
    newObject = {
      dto: {
        firstName: msg.firstName ? msg.firstName : '',
        lastName: msg.lastName ? msg.lastName : '',
        middleName: msg.middleName ? msg.middleName : '',
        salutation: msg.salutation ? msg.salutation : '',
        title: msg.title ? msg.title : '',
        birthday: msg.birthday ? msg.birthday : '',
        nickname: msg.nickname ? msg.nickname : '',
        jobTitle: msg.jobTitle ? msg.jobTitle : '',
        gender: msg.gender ? msg.gender : '',
      },
    };
  } else {
    newObject = {
      dto: {
        name: msg.name ? msg.name : '',
        logo: msg.logo ? msg.logo : '',
      },
    };
  }
  return newObject;
}

/**
 * @desc Upsert function which creates or updates
 * an object, depending on certain conditions
 *
 * @access  Private
 * @param {Object} msg - the whole incoming object
 * @param {String} token - token from Snazzy Contacts
 * @param {Boolean} objectExists - ig the object was found
 * @param {String} type - object type - 'person' or 'organization'
 * @param {Object} meta -  meta object containg meta inforamtion
 * @return {Object} - the new created ot update object in Snazzy Contacts
 */
async function upsertObject(msg, token, objectExists, type, meta) {
  if (!type) {
    return false;
  }

  let newObject;
  let uri;
  let method;

  console.error('OBJECT EXIStS: ', objectExists);

  if (objectExists) {
    // Update the object if it already exists
    method = 'PUT';
    uri = `${BASE_URI}/${type}/${meta.recordUid}`;
    newObject = prepareObject(msg, type);
    delete newObject.uid;
  } else {
    // Create the object if it does not exist
    method = 'POST';
    uri = `${BASE_URI}/${type}`;
    newObject = msg;
    delete newObject.uid;
    delete newObject.categories;
    delete newObject.relations;
  }

  try {
    const options = {
      method,
      uri,
      json: true,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: newObject,
    };

    const person = await request(options);
    return person;
  } catch (e) {
    return e;
  }
}

/**
 * This method fetches objects from Snazzy Contacts
 * depending on the value of count variable and type
 *
 * @param token - Snazzy Contacts token required for authentication
 * @param snapshot - current state of snapshot
 * @param count - amount of objects
 * @return {Object} - Array of person objects containing data and meta
 */
async function getEntries(token, snapshot, count, type) {
  let uri;
  if (count) {
    uri = `${BASE_URI}/${type}?num=${count}`;
  } else {
    uri = `${BASE_URI}/${type}`;
  }

  try {
    const requestOptions = {
      uri,
      json: true,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const entries = await fetchAll(requestOptions, snapshot);

    if (!entries.result || !Array.isArray(entries.result)) {
      return 'Expected records array.';
    }
    return entries;
  } catch (e) {
    throw new Error(e);
  }
}

module.exports = { getEntries, upsertObject };
