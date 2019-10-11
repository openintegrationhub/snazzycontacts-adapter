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

/**
 * This method will be called from OIH platform providing following data
 *
 * @param msg - incoming message object that contains ``body`` with payload
 * @param cfg - configuration that is account information and configuration field values
 * @param snapshot - saves the current state of integration step for the future reference
 */
async function processTrigger(msg, cfg, snapshot = {}) {
  // Authenticate and get the token from Snazzy Contacts
  const token = await getToken(cfg);
  const self = this;
  const iamToken = process.env.ELASTICIO_IAM_TOKEN;

  // Set the snapshot if it is not provided
  snapshot.lastUpdated = snapshot.lastUpdated || (new Date(0)).getTime();

  async function emitData() {
    // Make a request to Component repository to fetch the applicationUid
    const getApplicationUidOptions = {
      uri: `http://component-repository.openintegrationhub.com/components/${process.env.ELASTICIO_COMP_ID}`,
      json: true,
      headers: {
        Authorization: `Bearer ${iamToken}`,
      },
    };

    // Make request to Component Repository API
    const applicationUidResponse = await request.get(getApplicationUidOptions);

    // Create an OIH meta object which is required to make the Hub and Spoke architecture work properly
    const { applicationUid } = applicationUidResponse.data;
    const oihMeta = {
      applicationUid: (applicationUid != undefined && applicationUid != null) ? applicationUid : 'applicationUid not set yet',
      iamToken: (iamToken != undefined && iamToken != null) ? iamToken : 'iamToken not set yet',
    };

    // Get the total amount of fetched objects
    let count;
    const getCount = await getOrganizations(token, snapshot, count);
    count = getCount.count;

    const organizations = await getOrganizations(token, snapshot, count);

    console.log(`Found ${organizations.length} new records.`);

    if (organizations.length > 0) {
      organizations.forEach((elem) => {
        const newElement = {};
        // Attach object uid to oihMeta object
        oihMeta.recordUid = elem.uid;
        delete elem.uid;
        newElement.meta = oihMeta;
        newElement.data = elem;
        // Emit the object with meta and data properties
        self.emit('data', messages.newMessageWithBody(newElement));
      });
      // Get the lastUpdate property from the last object and attach it to snapshot
      snapshot.lastUpdated = organizations[organizations.length - 1].lastUpdate;
      console.log(`New snapshot: ${snapshot.lastUpdated}`);
      self.emit('snapshot', snapshot);
    } else {
      self.emit('snapshot', snapshot);
    }
  }

  /**
   * This method will be called from OIH platform if an error occured
   *
   * @param e - object containg the error
   */
  function emitError(e) {
    self.emit('error', e);
  }

  /**
   * This method will be called from OIH platform
   * when the execution is finished successfully
   *
   */
  function emitEnd() {
    console.log('Finished execution');
    self.emit('end');
  }

  Q()
    .then(emitData)
    .fail(emitError)
    .done(emitEnd);
}

/**
 * This method fetches organizations from Snazzy Contacts
 * depending on the value of count variable
 *
 * @param token - Snazzy Contacts token required for authentication
 * @param snapshot - current state of snapshot
 * @param count - amount of objects
 * @return {Object} - Array of person objects containing data and meta
 */
async function getOrganizations(token, snapshot = {}, count) {
  let uri;
  if (count) {
    uri = `https://api.snazzycontacts.com/api/organization?num=${count}`;
  } else {
    uri = 'https://api.snazzycontacts.com/api/organization';
  }

  try {
    const requestOptions = {
      uri,
      json: true,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const organizations = await fetchAll(requestOptions, snapshot);

    if (!organizations.result || !Array.isArray(organizations.result)) {
      return 'Expected records array.';
    }
    return organizations;
  } catch (e) {
    throw new Error(e);
  }
}

/**
 * This method fetches organizations from Snazzy Contacts
 *
 * @param options - request options
 * @param snapshot - current state of snapshot
 * @return {Object} - Array of person objects containing data and meta
 */
async function fetchAll(options, snapshot) {
  try {
    const result = [];
    const organizations = await request.get(options);

    if (Object.entries(organizations).length === 0 && organizations.constructor === Object) {
      return false;
    }

    organizations.data.filter((organization) => {
      // Push only this objects which were updated after last function call
      organization.lastUpdate > snapshot.lastUpdated && result.push(organization);
    });

    // Sort the objects by lastUpdate
    result.sort((a, b) => parseInt(a.lastUpdate) - parseInt(b.lastUpdate));
    return {
      result,
      count: organizations.meta.count,
    };
  } catch (e) {
    throw new Error(e);
  }
}

module.exports = {
  process: processTrigger,
  getOrganizations,
};
