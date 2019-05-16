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
const moment = require('moment');
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

  snapshot.lastUpdated = snapshot.lastUpdated || (new Date(0)).getTime(); // (new Date(0)).toISOString(); Date.now(); moment(0).toISOString();
  // snapshot.addQuery = snapshot.addQuery || false;
  snapshot.currentPage = snapshot.currentPage || 1;
  snapshot.processCount = snapshot.processCount || 0;
  snapshot.countPersons = snapshot.countPersons || 0;
  snapshot.paging = snapshot.paging || false;
  snapshot.underLimit = snapshot.underLimit || false;

  console.error('SNAPSHOT: ', snapshot);

  async function emitData() {
    // let query = false;
    //
    // if (snapshot.addQuery) {
    //   snapshot.currentPage++;
    //   query = `?page=${snapshot.currentPage}`;
    // }
    // console.error(`PAGE: ${snapshot.currentPage}`);
    // console.error(`QUERY: ${query}`);

    const persons = await getPersons(token, snapshot, query);

    // console.error(`Found ${persons.count} new records.`);
    console.error(`Found ${persons.result.length} new records.`);

    if (persons.count >= 1000) {
    }

    if (persons.count >= 1000) { // snapshot.processCount  5100 > 1000
      console.error('IN FIRST IF: LENGTH >= 1000');
      persons.result.forEach((elem) => {
        self.emit('data', messages.newMessageWithBody(elem));
      });
      snapshot.lastUpdated = persons.result[persons.result.length - 1].lastUpdate;
      // snapshot.addQuery = true;
      snapshot.processCount += persons.result.length;
      snapshot.currentPage += 1;
      console.error(`New snapshot: ${JSON.stringify(snapshot, undefined, 2)}`);
      return self.emit('snapshot', snapshot);
    }
    // if (persons.count < snapshot.processCount) { // 5100 < 300
    if (snapshot.processCount < 1000) { // 5100 < 300
      console.error('IN SECOND IF: LENGTH < 1000');
      persons.result.forEach((elem) => {
        self.emit('data', messages.newMessageWithBody(elem));
      });
      snapshot.lastUpdated = persons[persons.result.length - 1].lastUpdate;
      // snapshot.addQuery = false;
      snapshot.processCount = 0;
      console.error(`New snapshot: ${JSON.stringify(snapshot, undefined, 2)}`);
      return self.emit('snapshot', snapshot);
    }
    return self.emit('snapshot', snapshot);
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

async function getPersons(token, snapshot) {
  console.log(snapshot);
  const uri = `http://api.snazzyapps.de/api/person?page=${snapshot.currentPage}`;
  // query ? uri = `http://api.snazzyapps.de/api/person${query}` : uri = 'http://api.snazzyapps.de/api/person';
  // console.error(`IN GET PERSONS QUERY: ${query}`);
  // if (query) {
  //   uri = `http://api.snazzyapps.de/api/person${query}`;
  //   snapshot.paging = true;
  // } else {
  //   uri = 'http://api.snazzyapps.de/api/person';
  //   snapshot.paging = false;
  //   snapshot.underLimit = true;
  // }

  // console.error(`URI: ${uri}`);
  try {
    const requestOptions = {
      uri,
      json: true,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const persons = await fetchAll(requestOptions, snapshot);

    if (!persons.result || !Array.isArray(persons.result)) {
      return 'Expected records array.';
    }
    return persons;
  } catch (e) {
    throw new Error(e);
  }
}

async function fetchAll(options, snapshot) {
  // console.log('IN FETCH ALL URI: ', options.uri);
  try {
    const result = [];
    const persons = await request.get(options);
    // console.log('IN FETCH ALL PERSONS: ', persons.data.length);

    if (Object.entries(persons).length === 0 && persons.constructor === Object) {
      return false;
    }

    // console.log(`SNAPSHOT LAST UPDATED: ${snapshot.lastUpdated}`); // 1557996623881
    // console.log(`PERSON LAST UPDATE: ${persons.data[0].lastUpdate}`); // 1557751736869

    persons.data.filter((person) => {
      // const isoDate = moment(parsedDate).toISOString();
      // isoDate > snapshot.lastUpdated && result.push(person);
      if (person.lastUpdate > snapshot.lastUpdated || snapshot.paging || snapshot.underLimit) {
        // console.log('IN PERSONS DATA FILTER');
        snapshot.countPersons++;
        result.push(person);
      }
      // isoDate > snapshot.lastUpdated && result.push(person);
    });

    result.sort((a, b) =>
      // Date.parse(a.lastUpdate) - Date.parse(b.lastUpdate)
      parseInt(a.lastUpdate) - parseInt(b.lastUpdate));
    return {
      result,
      count: persons.meta.count,
    };
  } catch (e) {
    throw new Error(e);
  }
}

module.exports = {
  process: processTrigger,
  getPersons,
};
