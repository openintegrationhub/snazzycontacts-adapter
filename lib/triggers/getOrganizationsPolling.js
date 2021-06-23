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
const { getEntries } = require('./../utils/helpers');
const { getToken } = require('./../utils/authentication');
const { organizationToOih } = require('../transformations/organizationToOih');

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
    const { applicationUid, domainId, schema } = cfg;
    // const token = cfg.API_KEY;
    const token = await getToken(cfg);

    // Set the snapshot if it is not provided
    snapshot.lastUpdated = snapshot.lastUpdated || (new Date(0)).getTime();

    /** Create an OIH meta object which is required
    * to make the Hub and Spoke architecture work properly
    */
    const oihMeta = {
      applicationUid: (applicationUid !== undefined && applicationUid !== null) ? applicationUid : undefined,
      schema: (schema !== undefined && schema !== null) ? schema : undefined,
      domainId: (domainId !== undefined && domainId !== null) ? domainId : undefined,
    };

    const organizations = await getEntries(token, snapshot, 'organization', cfg.devMode, cfg.searchTerm);

    console.log(`Found ${organizations.result.length} new records.`);

    if (organizations.result.length > 0) {
      organizations.result.forEach((elem) => {
        const newElement = {};

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
            }
          }
        } else {
        // Attach object uid to oihMeta object
          oihMeta.recordUid = elem.uid;
        }
        delete elem.uid;
        newElement.metadata = oihMeta;
        newElement.data = elem;

        const transformedElement = transform(newElement, cfg, organizationToOih);

        // Emit the object with meta and data properties
        this.emit('data', transformedElement);
      });
      // Get the lastUpdate property from the last object and attach it to snapshot
      snapshot.lastUpdated = Date.parse(organizations.result[organizations.result.length - 1].updatedAt);
      console.log(`New snapshot: ${snapshot.lastUpdated}`);
      this.emit('snapshot', snapshot);
    } else {
      this.emit('snapshot', snapshot);
    }
  } catch (e) {
    console.log(`ERROR: ${e}`);
    this.emit('error', e);
  }
}

module.exports = {
  process: processTrigger,
};
