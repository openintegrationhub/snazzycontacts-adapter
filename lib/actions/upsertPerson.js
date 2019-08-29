/**
 * Copyright 2019 Wice GmbH
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */

const Q = require('q');
const request = require('request-promise');
const { messages } = require('elasticio-node');
const { getToken } = require('./../utils/snazzy');

// CFM configuration
const CFM = require('@wice-devs/cfm');

const cfm = new CFM();
const globalRules = {
  skipDuplicateEntry: 'myRule1',
};
const rules = {
  rejectEmpty: ['title', 'birthday'],
  // ifUpdate: ['specialKey', 'specialKey2'],
  uniqArray: ['contactData.[]', 'addresses.[]'],
  copyNew: ['firstName', 'lastName'],
};

cfm.setGlobalRules(globalRules);
cfm.setRules(rules);

const SNAZZY_URI = 'https://api.snazzycontacts.com/api/person';

/**
 * This method will be called from OIH platform providing following data
 *
 * @param msg incoming message object that contains ``body`` with payload
 * @param cfg configuration that is account information and configuration field values
 */
async function processAction(msg, cfg) {
  const token = await getToken(cfg);
  const self = this;

  async function emitData() {
    let personExists = false;
    const checkPerson = await checkForExistingUser(msg, token);
    let personObject = msg;

    if (checkPerson) {
      personExists = true;

      // Call CFM to resolve conflict
      const incomingObject = msg;
      const appObject = checkPerson;
      const resolved = await resolveConflict(incomingObject, appObject);

      // In case of identical objects just return
      if ((Object.entries(resolved).length === 0 && resolved.constructor === Object) || resolved === {}) {
        return;
      }
      personObject = resolved;
    }

    const reply = await upsertPerson(personObject, token, personExists);
    // self.emit('data', reply);

    const data = messages.newMessageWithBody(reply);
    self.emit('data', data);
  }

  function emitError(e) {
    console.log('Oops! Error occurred');
    self.emit('error', e);
  }

  function emitEnd() {
    console.log('Finished execution');
    self.emit('end');
  }

  Q()
    .then(emitData)
    .fail(emitError)
    .done(emitEnd);
}

async function upsertPerson(msg, token, personExists) {
  let newPerson;

  if (personExists) {
    console.log('EXISTS');
    method = 'PUT';
    uri = `${SNAZZY_URI}/${msg.uid}`;
    newPerson = {
      dto: {
        firstName: msg.firstName,
        lastName: msg.lastName,
      },
    };
  } else {
    console.log('DOES NOT EXISTS');
    method = 'POST';
    uri = SNAZZY_URI;
    newPerson = msg;
  }

  try {
    const options = {
      method,
      uri,
      json: true,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: newPerson,
    };

    const person = await request(options);

    // TODO: Add error handling
    return person;
  } catch (e) {
    // console.log(`ERROR: ${e}`);
    return e;
    // throw new Error(e);
  }
}

async function checkForExistingUser(msg, token) {
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

    if ((Object.entries(response).length === 0 && response.constructor === Object)
    || response.statusCode === 204
    || response.statusCode === 401
    || response.statusCode === 400
    ) {
      return false;
    }

    return response;
  } catch (e) {
    // console.log(`ERROR: ${e}`);
    return e;
    // throw new Error(e);
  }
}

function resolveConflict(incomingObject, appObject) {
  const resolved = cfm.resolve(incomingObject.body, appObject);
  console.log('RESOLVED: ', resolved);
  return resolved;
}

module.exports = {
  process: processAction,
  upsertPerson,
  checkForExistingUser,
  resolveConflict,
  processAction,
};
