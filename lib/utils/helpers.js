const request = require("request-promise");
const SNAZZY_URI = "https://api.snazzycontacts.com/api/person";

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
async function upsertPerson(msg, token, objectExists) {
  let newPerson;
  let uri;
  let method;

  if (objectExists) {
    method = "PUT";
    uri = `${SNAZZY_URI}/${msg.uid}`;
    // delete msg._id;
    // delete msg.uid;
    // delete msg.isUser;
    // delete msg.meta;
    // delete msg.lastUpdate;
    // delete msg.updateEvent;
    // delete msg.categories;
    // delete msg.relations;
    // delete msg.__v;
    // delete msg.lastUpdateBy;
    // delete msg.lastUpdateById;

    newPerson = {
      dto: {
        firstName: msg.firstName,
        lastName: msg.lastName
      }
    };
  } else {
    method = "POST";
    uri = SNAZZY_URI;
    newPerson = msg.body;
    delete newPerson.uid;
    delete newPerson.categories;
    delete newPerson.relations;
  }

  try {
    const options = {
      method,
      uri,
      json: true,
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: newPerson
    };

    const person = await request(options);
    return person;
  } catch (e) {
    // console.log(`ERROR: ${e}`);
    return e;
    // throw new Error(e);
  }
}

module.exports = upsertPerson;
