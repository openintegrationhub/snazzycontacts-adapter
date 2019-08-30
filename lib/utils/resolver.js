const request = require('request-promise');
const CFM = require('@wice-devs/cfm');

const cfm = new CFM();
const globalRules = {
  skipDuplicateEntry: 'myRule1',
};
const rules = {
  rejectEmpty: ['title', 'birthday', 'gender'],
  uniqArray: ['contactData.[]', 'addresses.[]'],
  copyNew: ['firstName', 'lastName'],
};

cfm.setGlobalRules(globalRules);
cfm.setRules(rules);

const SNAZZY_URI = 'https://api.snazzycontacts.com/api/person';

async function resolve(msg, token) {
  const appObject = await checkForExistingUser(msg, token);

  if (appObject) {
    const personExists = true;
    const resolvedConflict = resolveConflict(msg, appObject);

    // In case of identical objects just return
    if ((Object.entries(resolvedConflict).length === 0 && resolvedConflict.constructor === Object) || resolvedConflict === {}) {
      return;
    }
    console.log('IN: ', resolvedConflict);
    console.log('IN: ', personExists);

    return {
      resolvedConflict,
      personExists,
    };
  }
  return false;
}

async function checkForExistingUser(msg, token) {
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

function resolveConflict(incomingObject, appObject) {
  const resolved = cfm.resolve(incomingObject.body, appObject);
  return resolved;
}

module.exports = {
  resolve,
  checkForExistingUser,
  resolveConflict,
};
