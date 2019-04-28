/**
 * Copyright 2018 Wice GmbH

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

/**
 * This method will be called from elastic.io platform providing following data
 *
 * @param msg incoming message object that contains ``body`` with payload
 * @param cfg configuration that is account information and configuration field values
 * @param snapshot saves the current state of integration step for the future reference
 */
async function processTrigger(msg, cfg, snapshot = {}) {
  const token = await getToken(cfg);
  const self = this;

  snapshot.lastUpdated = snapshot.lastUpdated || (new Date(0)).toISOString();
  console.log(`Last Updated: ${snapshot.lastUpdated}`);

  async function emitData() {
    console.log('FLAG 1');
    const persons = await getPersons(token, snapshot);
    console.log('FLAG 5');
    console.log('IN EMIT DATA: ', persons.length);

    console.log(`Found ${persons.length} new records.`);

    if (persons.length > 0) {
      persons.forEach((elem) => {
        self.emit('data', messages.newMessageWithBody(elem));
      });
      snapshot.lastUpdated = persons[persons.length - 1].lastUpdate;
      console.log(`New snapshot: ${snapshot.lastUpdated}`);
      self.emit('snapshot', snapshot);
    } else {
      self.emit('snapshot', snapshot);
    }
  }

  function emitError(e) {
    console.log(`ERROR: ${e}`);
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

async function getPersons(token, snapshot = {}) {
  console.log('FLAG 2');
  try {
    const uri = 'http://canary-api.snazzyapps.de/api/person';

    const requestOptions = {
      uri,
      json: true,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const persons = await fetchAll(requestOptions, snapshot);
    console.log('FLAG 4');

    if (!persons || !Array.isArray(persons)) {
      return 'Expected records array.';
    }
    console.log('HERE: ', persons.length);
    return persons;
  } catch (e) {
    throw new Error(e);
  }
}

async function fetchAll(options, snapshot) {
  console.log('FLAG 3');
  try {
    const result = [];
    const persons = await request.get(options);
    // console.log('PERSONS: ', persons.data.length);

    console.log(persons);

    if (Object.entries(persons).length === 0 && persons.constructor === Object) {
      return false;
    }

    persons.data.filter((person) => {
      person.lastUpdate > snapshot.lastUpdated && result.push(person);
    });
    result.sort((a, b) => Date.parse(a.lastUpdate) - Date.parse(b.lastUpdate));

    // console.log('RESULT: ', result);

    return result;
  } catch (e) {
    throw new Error(e);
  }
}

module.exports = {
  process: processTrigger,
  getPersons,
};
