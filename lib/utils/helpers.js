/* eslint no-continue: "off" */
/* eslint no-await-in-loop: "off" */

const request = require('request-promise').defaults({ simple: false, resolveWithFullResponse: true });

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

// /**
//  * @desc Prepares a DTO object for updating
//  *
//  * @access  Private
//  * @param {Object} msg - the whole incoming object
//  * @param {String} type - either 'person 'or 'organization'
//  * @return {Object} - a new DTO object
//  */
// function prepareObject(msg, type) {
//   let newObject;
//   if (type === 'person') {
//     newObject = {
//       dto: {
//         firstName: msg.firstName ? msg.firstName : '',
//         lastName: msg.lastName ? msg.lastName : '',
//         middleName: msg.middleName ? msg.middleName : '',
//         salutation: msg.salutation ? msg.salutation : '',
//         title: msg.title ? msg.title : '',
//         birthday: msg.birthday ? msg.birthday : '',
//         nickname: msg.nickname ? msg.nickname : '',
//         jobTitle: msg.jobTitle ? msg.jobTitle : '',
//         gender: msg.gender ? msg.gender : '',
//       },
//     };
//   } else {
//     newObject = {
//       dto: {
//         name: msg.name ? msg.name : '',
//         logo: msg.logo ? msg.logo : '',
//       },
//     };
//   }
//   return newObject;
// }

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
 * @param {Boolean} devMode -  Denotes whether the dev api or production api should be called
 * @return {Object} - the new created ot update object in Snazzy Contacts
 */
async function upsertObject(msg, token, objectExists, type, recordUid, devMode) {
  if (!type) {
    return false;
  }

  const BASE_URI = devMode === true ? 'https://dev-api.snazzyapps.de/api' : 'https://api.snazzycontacts.com/api';

  let newObject;
  let uri;
  let method;

  if (objectExists) {
    // Update the object if it already exists
    method = 'PUT';
    uri = `${BASE_URI}/operation/${type}`;
    newObject = msg;
    newObject.uid = recordUid;
  } else {
    // Create the object if it does not exist
    method = 'POST';
    uri = `${BASE_URI}/operation`;
    newObject = msg;
    delete newObject.uid;
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
      qs: {
        type,
      },
    };

    const response = await request(options);
    if (response.statusCode !== 200) {
      console.log('Could not upsert object!');
      console.log('Status: ', response.statusCode);
      console.log(JSON.stringify(response.body));
    }
    return response;
  } catch (e) {
    return e;
  }
}


/**
 * @desc Attempts to fetch a snazzy entry by its stored reference
 *
 * @access  Private
 * @param {String} appId - the application ID
 * @param {String} recordUid - The uid of the object reference
 * @param {String} token - token from Snazzy Contacts
 * @param {String} type - object type - 'person' or 'organization'
 * @param {Boolean} devMode -  Denotes whether the dev api or production api should be called
 * @return {Object} - the new created ot update object in Snazzy Contacts
 */
async function fetchUidFromReference(appId, recordUid, token, type, devMode) {
  const BASE_URI = devMode === true ? 'https://dev-api.snazzyapps.de/api' : 'https://api.snazzycontacts.com/api';

  const options = {
    method: 'GET',
    uri: `${BASE_URI}/${type}/reference`,
    json: true,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    qs: {
      appId,
      recordUid,
    },
  };

  let objectExists = false;
  let returnRecordUid = recordUid;

  const response = await request(options);

  if (response.statusCode === 200) {
    objectExists = true;
    returnRecordUid = response.body.uid;
  }

  return { objectExists, recordUid: returnRecordUid };
}

/**
 * @desc Attempts to populate relations with proper uids by looking up references
 *
 * @access  Private
 * @param {String} object - the person or organization containing relations
 * @param {String} cfg - The config containing various necessary metadata
 * @return {Object} - the passed-in object, modified with populated relations entries
 */
async function populateRelations(object, cfg, token, objectUid) {
  const relationObject = object;

  if (!relationObject || !relationObject.relations || relationObject.relations.length === 0) {
    return relationObject;
  }

  for (let i = 0; i < relationObject.relations.length; i += 1) {
    relationObject.relations[i].typeRef = '';
    if (objectUid) {
      relationObject.relations[i].uids.push(objectUid);
    }

    const organizationResponse = await fetchUidFromReference(cfg.sourceApp, relationObject.relations[i].uids[0], token, 'organization', cfg.devMode);

    if (organizationResponse.objectExists === true) {
      relationObject.relations[i].uids[0] = organizationResponse.recordUid;
      continue;
    }

    const personResponse = await fetchUidFromReference(cfg.sourceApp, relationObject.relations[i].uids[0], token, 'person', cfg.devMode);

    if (personResponse.objectExists === true) {
      relationObject.relations[i].uids[0] = personResponse.recordUid;
      continue;
    }

    // If no reference can be found, throw out the current entry
    if (!organizationResponse.objectExists && !personResponse.objectExists) {
      relationObject.relations.splice(i, 1);
      i -= 1;
    }
  }

  return relationObject;
}

/**
 * This method fetches objects from Snazzy Contacts
 * depending on the value of count variable and type
 *
 * @param token - Snazzy Contacts token required for authentication
 * @param snapshot - current state of snapshot
 * @param count - amount of objects
 * @param {String} type -  One of person or organization
 * @param {Boolean} devMode -  Denotes whether the dev api or production api should be called
 * @return {Object} - Array of person objects containing data and meta
 */
async function getEntries(token, snapshot, count, type, devMode) {
  const BASE_URI = devMode === true ? 'https://dev-api.snazzyapps.de/api' : 'https://api.snazzycontacts.com/api';

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

module.exports = {
  getEntries, upsertObject, fetchUidFromReference, populateRelations,
};
