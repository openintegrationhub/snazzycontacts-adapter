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

  snapshot.lastUpdated = snapshot.lastUpdated || (new Date(0)).getTime()// (new Date(0)).toISOString();
  console.log(`Last Updated: ${snapshot.lastUpdated}`);

  async function emitData() {
    const organizations = await getOrganizations(token, snapshot);

    console.log(`Found ${organizations.length} new records.`);

    if (organizations.length > 0) {
      organizations.forEach((elem) => {
        self.emit('data', messages.newMessageWithBody(elem));
      });
      snapshot.lastUpdated = organizations[organizations.length - 1].lastUpdate;
      console.log(`New snapshot: ${snapshot.lastUpdated}`);
      self.emit('snapshot', snapshot);
    } else {
      self.emit('snapshot', snapshot);
    }
  }

  function emitError(e) {
    // console.log(`ERROR: ${e}`);
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

async function getOrganizations(token, snapshot = {}) {
  try {
    const uri = 'https://api.snazzycontacts.com/api/organization';

    const requestOptions = {
      uri,
      json: true,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const organizations = await fetchAll(requestOptions, snapshot);

    if (!organizations || !Array.isArray(organizations)) {
      return 'Expected records array.';
    }
    return organizations;
  } catch (e) {
    throw new Error(e);
  }
}

async function fetchAll(options, snapshot) {
  try {
    const result = [];
    const organizations = await request.get(options);

    if (Object.entries(organizations).length === 0 && organizations.constructor === Object) {
      return false;
    }

    organizations.data.filter((organization) => {
      // const parsedDate = parseInt(organization.lastUpdate);
      // const isoDate = moment(parsedDate).toISOString();
      // isoDate > snapshot.lastUpdated && result.push(organization);
      organization.lastUpdate > snapshot.lastUpdated && result.push(organization);
    });

    // result.sort((a, b) => Date.parse(a.lastUpdate) - Date.parse(b.lastUpdate));
    result.sort(function(a, b) {
      // Date.parse(a.lastUpdate) - Date.parse(b.lastUpdate)
          return parseInt(a.lastUpdate) - parseInt(b.lastUpdate);
    });
    return result;
  } catch (e) {
    throw new Error(e);
  }
}

module.exports = {
  process: processTrigger,
  getOrganizations,
};
