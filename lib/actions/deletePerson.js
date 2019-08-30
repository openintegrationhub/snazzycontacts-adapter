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
// const { messages } = require('elasticio-node');
const { getToken } = require('./../utils/snazzy');

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
    const reply = await deletePerson(msg, token);
    self.emit('data', reply);
    // const data = messages.newMessageWithBody(reply);
    // self.emit('data', data);
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

async function deletePerson(msg, token) {
  try {
    const { uid } = msg.body;
    const uri = `https://api.snazzycontacts.com/api/person/${uid}`;

    const options = {
      uri,
      json: true,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const person = await request.delete(options);

    // TODO: Add error handling
    return person;
  } catch (e) {
    // console.log(`ERROR: ${e}`);
    return e;
    // throw new Error(e);
  }
}

module.exports = {
  process: processAction,
  deletePerson,
};
