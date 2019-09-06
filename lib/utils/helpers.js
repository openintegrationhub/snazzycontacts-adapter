const request = require('request-promise');

const BASE_URI = 'https://api.snazzycontacts.com/api';

/**
 * @desc Upsert function which creates or updates
 * an object, depending on certain conditions
 *
 * @access  Private
 * @param {Object} msg - the whole incoming object
 * @param {String} token - token from Snazzy Contacts
 * @param {Boolean} objectExists - ig the object was found
 * @return {Object} - the new created ot update object in Snazzy Contacts
 */
async function upsertObject(msg, token, objectExists, type) {
  if (!type) {
    return false;
  }

  let newObject;
  let uri;
  let method;

  if (objectExists) {
    method = 'PUT';
    uri = `${BASE_URI}/${type}/${msg.uid}`;
    newObject = prepareObject(msg, type);
  } else {
    method = 'POST';
    uri = `${BASE_URI}/${type}`;
    newObject = msg.body.data;
    // newObject = prepareObject(msg.body, type);
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
    console.log(`ERROR: ${e}`);
    return e;
    // throw new Error(e);
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

module.exports = upsertObject;
