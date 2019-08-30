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

const SNAZZY_URI = 'https://api.snazzycontacts.com/api/person';


async function upsertPerson(msg, token, personExists) {
  let newPerson;
  let uri;
  let method;

  if (personExists) {
    method = 'PUT';
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
        lastName: msg.lastName,
      },
    };
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
    // console.log(`ERROR: ${e}`);
    return e;
    // throw new Error(e);
  }
}

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

      if (cfmResponse) {
        personObject = cfmResponse.resolvedConflict;
        personExists = cfmResponse.exists;
      }
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

module.exports = {
  process: processAction,
  upsertPerson,
};
