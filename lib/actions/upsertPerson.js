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
const { resolve } = require('./../utils/resolver');

// CFM configuration
// const CFM = require('@wice-devs/cfm');
//
// const cfm = new CFM();
// const globalRules = {
//   skipDuplicateEntry: 'myRule1',
// };
// const rules = {
//   rejectEmpty: ['title', 'birthday', 'gender'],
//   uniqArray: ['contactData.[]', 'addresses.[]'],
//   copyNew: ['firstName', 'lastName'],
// };
//
// cfm.setGlobalRules(globalRules);
// cfm.setRules(rules);

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
    const { uid } = msg.body;
    let personExists = false;
    let personObject = msg;

    if (uid && uid !== '' && uid !== 'undefined') {
      const cfmResponse = await resolve(msg, token);
      personObject = cfmResponse.resolvedConflict;
      personExists = cfmResponse.personExists;

      // const appObject = await checkForExistingUser(msg, token);
      //
      // if (appObject) {
      //   personExists = true;
      //
      //   // Call CFM to resolve a potential conflict
      //   const resolved = await resolveConflict(msg, appObject);
      //
      //   // In case of identical objects just return
      //   if ((Object.entries(resolved).length === 0 && resolved.constructor === Object) || resolved === {}) {
      //     return;
      //   }
      //   personObject = resolved;
      // }
    }

    console.log('PERSON EXISTS', personExists);
    console.log('--------------------');
    // console.log('PERSON OBJECT', personObject);

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
  let uri;
  let method;

  if (personExists) {
    method = 'PUT';
    uri = `${SNAZZY_URI}/${msg.uid}`;
    delete msg._id;
    delete msg.isUser;
    delete msg.meta;
    delete msg.lastUpdate;
    delete msg.updateEvent;
    delete msg.categories;
    delete msg.relations;
    delete msg.__v;
    delete msg.lastUpdateBy;
    delete msg.lastUpdateById;

    newPerson = {
      dto: msg,
    };
    console.log('NEW PERSON: ', newPerson);
  } else {
    method = 'POST';
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
        Authorization: `Bearer ${token}`,
      },
      body: newPerson,
    };

    const person = await request(options);
    return person;
  } catch (e) {
    console.log(`ERROR: ${e}`);
    return e;
    // throw new Error(e);
  }
}

// async function checkForExistingUser(msg, token) {
//   if (!token || !msg) {
//     return false;
//   }
//
//   try {
//     const options = {
//       method: 'GET',
//       uri: `${SNAZZY_URI}/${msg.body.uid}`,
//       json: true,
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     };
//
//     const response = await request(options);
//
//     if (response === 'undefined' || response === undefined) {
//       return false;
//     }
//
//     // if ((Object.entries(response).length === 0 && response.constructor === Object)
//     // || response.statusCode === 204
//     // || response.statusCode === 401
//     // || response.statusCode === 400
//     // || !response
//     // || response === 'undefined'
//     // || response === undefined
//     // ) {
//     //   console.log('BOOM');
//     //   return false;
//     // }
//
//     return response;
//   } catch (e) {
//     console.log(`ERROR: ${e}`);
//     return e;
//     // throw new Error(e);
//   }
// }

// function resolveConflict(incomingObject, appObject) {
//   const resolved = cfm.resolve(incomingObject.body, appObject);
//   return resolved;
// }

module.exports = {
  process: processAction,
  upsertPerson,
};
