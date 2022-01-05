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
    const entries = await request.get(options);

    if (Object.entries(entries.body).length === 0 && entries.body.constructor === Object) {
      return false;
    }

    const result = (entries.body.data) ? entries.body.data : [];

    // Sort the objects by lastUpdate ASC
    result.sort((a, b) => Date.parse(a.updatedAt) - Date.parse(b.updatedAt));

    const newEntries = [];
    const { length } = result;
    for (let i = 0; i < length; i += 1) {
      const timestamp = Date.parse(result[i].updatedAt);
      if (timestamp > snapshot.lastUpdated) {
        newEntries.push(result[i]);
      }
    }
    // console.log('newEntries', newEntries);
    return {
      result: newEntries,
      count: newEntries.length,
    };
  } catch (e) {
    throw new Error(e);
  }
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
      console.log('Body: ', JSON.stringify(options.body));
      console.log('Status: ', response.statusCode);
      console.log(JSON.stringify(response.body));
    }
    return response;
  } catch (e) {
    return e;
  }
}


/**
 * @desc Upsert function which creates or updates
 * an object, depending on certain conditions and using smart backend
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
async function upsertObjectAdvanced(msg, token, objectExists, type, recordUid, appId, metaUserId, devMode) {
  if (!type) {
    return false;
  }

  const BASE_URI = devMode === true ? 'https://dev-api.snazzyapps.de/api' : 'https://api.snazzycontacts.com/api';

  const newObject = msg;
  const uri = `${BASE_URI}/operation/integration/${type}`;

  const qs = {
    appId,
    recordUid,
    metaUserId,
  };

  delete newObject.uid;

  try {
    const options = {
      method: 'PUT',
      uri,
      json: true,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: newObject,
      qs,
    };

    const response = await request(options);

    if (response.statusCode !== 200) {
      console.log('Could not upsert object!');
      console.log('Body: ', JSON.stringify(options.body));
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
async function fetchUidFromReference(appId, recordUid, token, type, metaUserId, devMode) {
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
      metaUserId,
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
    if (!relationObject.relations[i]
      || !relationObject.relations[i].uids
      || !relationObject.relations[i].uids.length) {
      relationObject.relations.splice(i, 1);
      i -= 1;
      break;
    }

    relationObject.relations[i].typeRef = '';
    if (objectUid) {
      relationObject.relations[i].uids.push(objectUid);
    }

    const organizationResponse = await fetchUidFromReference(
      cfg.sourceApp,
      relationObject.relations[i].uids[0],
      token,
      'organization',
      cfg.metaUserId,
      cfg.devMode,
    );

    if (organizationResponse.objectExists === true) {
      relationObject.relations[i].uids[0] = organizationResponse.recordUid;
      continue;
    }

    const personResponse = await fetchUidFromReference(
      cfg.sourceApp,
      relationObject.relations[i].uids[0],
      token,
      'person',
      cfg.metadatadata,
      cfg.devMode,
    );

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
 * This method formats the response objects from the search service into the regular SC format
 *
 * @param {object} contact - A contact in the "spread" format returned by the search service
 * @return {Object} - A formatted contact in the usual SC format
 */
function formatSearchResult(contact) {
  const formattedObject = {
    uid: contact.uid,
    lastUpdate: contact.timestamp,
    contactData: [],
    addresses: [],
    categories: [],
  };

  if (contact.name) {
    formattedObject.name = contact.name;
    formattedObject.logo = contact.logo;
  } else {
    formattedObject.firstName = contact.firstName;
    formattedObject.lastName = contact.lastName;
    formattedObject.middleName = contact.middleName;
    formattedObject.title = contact.title;
    formattedObject.photo = contact.photo;
    formattedObject.salutation = contact.salutation;
    formattedObject.gender = contact.gender;
    formattedObject.birthday = contact.birthday;
    formattedObject.displayName = contact.displayName;
    formattedObject.nickname = contact.nickname;
  }

  for (let i = 0; `contactData.${i}.type` in contact; i += 1) {
    const cd = {
      type: contact[`contactData.${i}.type`],
      value: contact[`contactData.${i}.value`],
    };

    formattedObject.contactData.push(cd);
  }

  for (let i = 0;
    `addresses.${i}.street` in contact
    || `addresses.${i}.streetNumber` in contact
    || `addresses.${i}.city` in contact
    || `addresses.${i}.zipcode` in contact
    || `addresses.${i}.country` in contact;
    i += 1) {
    const adr = {
      street: contact[`addresses.${i}.street`] || '',
      streetNumber: contact[`addresses.${i}.streetNumber`] || '',
      city: contact[`addresses.${i}.city`] || '',
      zipcode: contact[`addresses.${i}.zipcode`] || '',
      country: contact[`addresses.${i}.country`] || '',
    };

    formattedObject.addresses.push(adr);
  }

  for (let i = 0; `categories.${i}.label` in contact; i += 1) {
    const cat = {
      label: contact[`categories.${i}.label`],
      uid: contact[`categories.${i}.uid`],
    };

    formattedObject.categories.push(cat);
  }

  return formattedObject;
}

/**
 * This method fetches a selection of objects based on a search term
 * and will automatically reformat the result according to the SC schema
 *
 * @param {object} options - The request options required for reaching the search service
 * @param {object} snapshot - current state of snapshot
 * @return {Object} - Array of objects containing data and meta
 */
async function executeSearch(options, type, snapshot) {
  const response = await request(options);

  if (response.statusCode !== 200) {
    console.error('Search failed!');
    console.error('Status: ', response.statusCode);
    console.error(JSON.stringify(response.body));
    return false;
  }

  const objects = response.body[1];
  const result = [];

  for (let i = 0; i < objects.length; i += 1) {
    const currentObject = objects[i];

    if (currentObject.timestamp > snapshot.lastUpdated) {
      if (
        (type === 'organization' && currentObject.name)
        || (type === 'person' && (currentObject.firstName || currentObject.lastName))
      ) result.push(formatSearchResult(currentObject));
    }
  }

  result.sort((a, b) => parseInt(a.lastUpdate, 10) - parseInt(b.lastUpdate, 10));

  return {
    result,
    count: result.length,
  };
}

/**
 * This method fetches objects from Snazzy Contacts
 * depending on the value of count variable and type
 *
 * @param token - Snazzy Contacts token required for authentication
 * @param snapshot - current state of snapshot
 * @param {String} type -  One of person or organization
 * @param {Boolean} devMode -  Denotes whether the dev api or production api should be called
 * @return {Object} - Array of person objects containing data and meta
 */
async function getEntries(token, snapshot, type, devMode, searchTerm) {
  try {
    let entries = {};

    if (searchTerm) {
      const uri = devMode === true ? 'https://dev-api.snazzyapps.de/api/search' : 'https://api.snazzycontacts.com/api/search';


      const requestOptions = {
        method: 'GET',
        uri,
        json: true,
        qs: {
          term: searchTerm,
          num: 1000,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      entries = await executeSearch(requestOptions, type, snapshot);
    } else {
      const uri = devMode === true ? `https://dev-api.snazzyapps.de/api/${type}` : `https://api.snazzycontacts.com/api/${type}`;


      const requestOptions = {
        uri,
        json: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      entries = await fetchAll(requestOptions, snapshot);
    }


    if (!entries.result || !Array.isArray(entries.result)) {
      return 'Expected records array.';
    }
    return entries;
  } catch (e) {
    throw new Error(e);
  }
}


/**
 * @desc Function which deletes
 * an object by specified recordUid
 *
 * @access  Private
 * @param {Object} msg - the whole incoming object
 * @param {String} token - token from Snazzy Contacts
 * @param {Boolean} objectExists - ig the object was found
 * @param {String} type - object type - 'person' or 'organization'
 * @param {Object} meta -  meta object containg meta inforamtion
 * @param {Boolean} devMode -  Denotes whether the dev api or production api should be called
 * @return {Object} - a delete confirmation or an error message
 */
async function deleteObject(token, type, recordUid, devMode) {
  if (!type) {
    return false;
  }

  const BASE_URI = devMode === true ? 'https://dev-api.snazzyapps.de/api' : 'https://api.snazzycontacts.com/api';

  const method = 'DELETE';
  const uri = `${BASE_URI}/${type}`;
  const newObject = {
    signature: '',
  };

  try {
    const options = {
      method,
      uri,
      json: true,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        uid: recordUid,
      },
    };

    console.log('Options:', options);
    const response = await request(options);

    if (response.statusCode !== 200) {
      console.log('Could not delete object!');
      console.log('Body: ', JSON.stringify(options.body));
      console.log('Status: ', response.statusCode);
      console.log(JSON.stringify(response.body));

      newObject.delete = 'failed';
      if (response.statusCode !== 404) {
        newObject.comment = 'Not found';
      } else if (response.statusCode !== 401 || response.statusCode !== 403) {
        newObject.delete = 'denied';
        newObject.comment = `${response.statusCode}`;
      }
    } else {
      newObject.delete = 'confirmed';
    }

    newObject.timestamp = `${Date.now()}`;

    return newObject;
  } catch (e) {
    console.log(e);
    return false;
  }
}


/**
 * @desc Function which deletes
 * an object by specified recordUid
 *
 * @access  Private
 * @param {Object} msg - the whole incoming object
 * @param {String} token - token from Snazzy Contacts
 * @param {Boolean} objectExists - ig the object was found
 * @param {String} type - object type - 'person' or 'organization'
 * @param {Object} meta -  meta object containg meta inforamtion
 * @param {Boolean} devMode -  Denotes whether the dev api or production api should be called
 * @return {Object} - a delete confirmation or an error message
 */
async function getAllDeletedSince(timestamp, token, cfg, entryType, devMode) {
  const BASE_URI = devMode === true ? 'https://dev-api.snazzyapps.de/api' : 'https://api.snazzycontacts.com/api';

  const method = 'GET';
  const uri = `${BASE_URI}/all/getAllDeleted/${timestamp}`;

  try {
    const options = {
      method,
      uri,
      json: true,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await request(options);
    if (response.statusCode !== 200 || !Array.isArray(response.body)) {
      if (response.statusCode === 204 || response.statusCode === 404) {
        console.log('No deleted entries found!');
        return [];
      }
      console.log('Could not get deleted entries!');
      console.log('Body: ', JSON.stringify(options.body));
      console.log('Status: ', response.statusCode);
      console.log(JSON.stringify(response.body));
      return false;
    }

    const { length } = response.body;

    const deleteMessages = [];
    for (let i = 0; i < length; i += 1) {
      if (response.body[i].payload && response.body[i].payload.uid) {
        if (entryType && response.body[i].eventName.indexOf(entryType) !== 0) continue;
        const message = {
          metadata: {
            recordUid: response.body[i].payload.uid,
            applicationUid: cfg.applicationUid,
          },
          data: {
            deleteRequested: true,
          },
        };
        deleteMessages.push(message);
      } else {
        console.log('Found broken delete event');
        console.log('Entry: ', JSON.stringify(response.body[i]));
      }
    }

    return deleteMessages;
  } catch (e) {
    console.log(e);
    return false;
  }
}

module.exports = {
  getEntries, upsertObject, upsertObjectAdvanced, fetchUidFromReference, populateRelations, deleteObject, getAllDeletedSince,
};
