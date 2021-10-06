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
const { checkForExistingObject } = require('./../utils/resolver');
const {
  upsertObjectAdvanced, fetchUidFromReference, populateRelations,
} = require('./../utils/helpers');
const { personFromOih } = require('../transformations/personFromOih');
const { getToken } = require('./../utils/authentication');

/**
 * This method will be called from OIH platform providing following data
 *
 * @param {Object} msg - incoming message object that contains ``body`` with payload
 * @param {Object} cfg - configuration that is account information and configuration field values
 */
async function processAction(msg, cfg) {
  try {
    const token = await getToken(cfg);

    if (cfg.devMode) {
      console.log('Message received:');
      console.log(JSON.stringify(msg));
    }

    const transformedMessage = transform(msg, cfg, personFromOih);

    const oihUid = (transformedMessage.metadata) ? transformedMessage.metadata.oihUid : 'oihUid not set yet';
    let recordUid = (transformedMessage.metadata) ? transformedMessage.metadata.recordUid : null;
    const applicationUid = (transformedMessage.metadata) ? transformedMessage.metadata.applicationUid : null;

    /** Create an OIH metadata object which is required
    * to make the Hub and Spoke architecture work properly
    */
    const newElement = {};
    const oihMeta = {
      applicationUid,
      oihUid,
      recordUid,
    };

    let objectExists = false;
    let personObject = transformedMessage.data;

    if (recordUid && recordUid !== '' && recordUid !== 'undefined') {
      // If option is set, insert reference for snazzy ref management instead of using cfm
      if (cfg.sourceApp) {
        const fetchResponse = await fetchUidFromReference(cfg.sourceApp, recordUid, token, 'person', cfg.metaUserId, cfg.devMode);

        recordUid = fetchResponse.recordUid;  // eslint-disable-line
        objectExists = fetchResponse.objectExists; // eslint-disable-line

        if (!objectExists && cfg.snazzyFlowVersion > 1) {
          const response = await checkForExistingObject(msg, token, 'person', cfg.devMode);
          if (response) objectExists = true;
        }

        if (!objectExists) {
          if (personObject.contactData) {
            if (cfg.metaUserId) {
              personObject.contactData.push({ type: `reference:${cfg.sourceApp}_${cfg.metaUserId}`, value: String(recordUid) });
            } else {
              personObject.contactData.push({ type: `reference:${cfg.sourceApp}`, value: String(recordUid) });
            }
          } else if (cfg.metaUserId) {
            personObject.contactData = [{ type: `reference:${cfg.sourceApp}_${cfg.metaUserId}`, value: String(recordUid) }];
          } else {
            personObject.contactData = [{ type: `reference:${cfg.sourceApp}`, value: String(recordUid) }];
          }
        }

        personObject = await populateRelations(personObject, cfg, token);
      } else {
        const response = await checkForExistingObject(msg, token, 'person', cfg.devMode);

        if (response) objectExists = true;
        // Conflict Management implementation
        // const cfmResponse = await resolve(msg, token, 'person');
        //
        // if (cfmResponse) {
        //   personObject = cfmResponse.resolvedConflict;
        //   objectExists = cfmResponse.exists;
        // }
      }
    }

    if (cfg.selectedCategory || cfg.selectedCategoryUid) {
      if (!personObject.categories) personObject.categories = [];

      const category = {};
      if (cfg.selectedCategory) category.label = cfg.selectedCategory;
      if (cfg.selectedCategoryUid) category.uid = cfg.selectedCategoryUid;

      personObject.categories.push(category);
    }

    if (cfg.selectedGroups) {
      personObject.groups = cfg.selectedGroups;
    }

    // Upsert the object
    const reply = await upsertObjectAdvanced(personObject, token, objectExists, 'person', recordUid, cfg.sourceApp, cfg.metaUserId, cfg.devMode);

    delete oihMeta.applicationUid;

    if (objectExists) {
      const result = [];
      reply.body.forEach((elem) => {
        delete elem.payload.uid;
        result.push(elem);
      });
      newElement.data = result.body;
      oihMeta.recordUid = recordUid;
    } else if (reply && reply.body && reply.body[0].payload && reply.body[0].payload.uid) {
      oihMeta.recordUid = reply.body[0].payload.uid;
      delete reply.body[0].payload.uid;
      newElement.data = reply.body[0].payload;
    }

    newElement.metadata = oihMeta;

    this.emit('data', newElement);
  } catch (e) {
    console.error('ERROR: ', e);
    console.log('Oops! Error occurred');
    this.emit('error', e);
  }
}

module.exports = {
  process: processAction,
};
