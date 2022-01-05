/* eslint no-param-reassign: "off" */

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

const { transform } = require('@openintegrationhub/ferryman');
const { getEntries, getAllDeletedSince } = require('./../utils/helpers');
const { getToken } = require('./../utils/authentication');
const { personToOih } = require('../transformations/personToOih');

/**
 * This method will be called from OIH platform providing following data
 *
 * @param msg - incoming message object that contains ``body`` with payload
 * @param cfg - configuration that is account information and configuration field values
 * @param snapshot - saves the current state of integration step for the future reference
 */
async function processTrigger(msg, cfg, snapshot = {}) {
  try {
  // Authenticate and get the token from Snazzy Contacts
    const { applicationUid } = cfg;
    // const token = cfg.API_KEY;
    const token = await getToken(cfg);

    // Set the snapshot if it is not provided
    snapshot.lastUpdated = snapshot.lastUpdated || (new Date(0)).getTime();

    const startSnapshot = snapshot.lastUpdated;

    /** Create an OIH meta object which is required
    * to make the Hub and Spoke architecture work properly
    */
    const oihMeta = {
      applicationUid: applicationUid || 'snazzy',
    };

    const persons = await getEntries(token, snapshot, 'person', cfg.devMode, cfg.searchTerm);

    console.error(`Found ${persons.result.length} new records.`);

    if (persons.result.length > 0) {
      persons.result.forEach((elem) => {
        const newElement = {};

        if (!cfg.targetApp || (cfg.snazzyFlowVersion && cfg.snazzyFlowVersion > 1)) oihMeta.recordUid = elem.uid;


        if (cfg.targetApp) {
          // If using Snazzy reference handling, add target reference
          if (elem.contactData) {
            let index;
            if (cfg.metaUserId) {
              index = elem.contactData.findIndex(cd => cd.type === `reference:${cfg.targetApp}_${cfg.metaUserId}`);
            } else {
              index = elem.contactData.findIndex(cd => cd.type === `reference:${cfg.targetApp}`);
            }

            if (index !== -1) {
              oihMeta.recordUid = elem.contactData[index].value;
              oihMeta.applicationUid = cfg.targetApp;
            }
          }
        }

        delete elem.uid;
        newElement.metadata = oihMeta;
        newElement.data = elem;

        const transformedElement = transform(newElement, cfg, personToOih);

        // Emit the object with meta and data properties
        this.emit('data', transformedElement);
      });
      // Get the lastUpdate property from the last object and attach it to snapshot

      if (
        cfg.searchTerm
        && persons
        && persons.result
        && persons.result[persons.result.length - 1].lastUpdate
      ) {
        snapshot.lastUpdated = persons.result[persons.result.length - 1].lastUpdate;
      } else {
        snapshot.lastUpdated = Date.parse(persons.result[persons.result.length - 1].updatedAt);
      }

      console.error(`New snapshot: ${JSON.stringify(snapshot, undefined, 2)}`);
    }
    this.emit('snapshot', snapshot);

    if (cfg.deletes && startSnapshot > 0) {
      const result = await getAllDeletedSince(startSnapshot, token, cfg, 'Person', cfg.devMode);
      if (result && Array.isArray(result)) {
        const { length } = result;
        console.log(`Found ${length} deleted entries since ${startSnapshot}`);
        for (let i = 0; i < length; i += 1) {
          this.emit('data', result[i]);
        }
      }
    }
  } catch (e) {
    console.log(`ERROR: ${e}`);
    this.emit('error', e);
  }
}

module.exports = {
  process: processTrigger,
};
