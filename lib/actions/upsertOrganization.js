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
const { resolve } = require('./../utils/resolver');
const { upsertObject, fetchUidFromReference, newMessage } = require('./../utils/helpers');
const { organizationFromOih } = require('../transformations/organizationFromOih');
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

    const transformedMessage = transform(msg, cfg, organizationFromOih);

    const oihUid = (transformedMessage.meta) ? transformedMessage.meta.oihUid : 'oihUid not set yet';
    let recordUid = (transformedMessage.meta) ? transformedMessage.meta.recordUid : null;
    const applicationUid = (transformedMessage.meta) ? transformedMessage.meta.applicationUid : null;


    /** Create an OIH meta object which is required
    * to make the Hub and Spoke architecture work properly
    */
    const newElement = {};
    const oihMeta = {
      applicationUid,
      oihUid,
      recordUid,
    };

    let objectExists = false;
    let organizationObject = transformedMessage.data;

    if (recordUid && recordUid !== '' && recordUid !== 'undefined') {
      // If option is set, insert reference for snazzy ref management instead of usingcfm
      if (cfg.sourceApp) {
        const fetchResponse = await fetchUidFromReference(cfg.sourceApp, recordUid, token, 'person', cfg.devMode);

        recordUid = fetchResponse.recordUid;  // eslint-disable-line
        objectExists = fetchResponse.objectExists; // eslint-disable-line

        if (!objectExists) {
          if (organizationObject.contactData) {
            organizationObject.contactData.push({ type: `reference:${cfg.sourceApp}`, value: String(recordUid) });
          } else {
            organizationObject.contactData = [{ type: `reference:${cfg.sourceApp}`, value: String(recordUid) }];
          }
        }
      } else {
        // Conflict Management implementation
        const cfmResponse = await resolve(msg, token, 'organization');

        if (cfmResponse) {
          organizationObject = cfmResponse.resolvedConflict;
          objectExists = cfmResponse.exists;
        }
      }
    }

    // Upsert the object depending on 'objectExists' property
    const reply = await upsertObject(organizationObject, token, objectExists, 'organization', recordUid, cfg.devMode);

    if (objectExists) {
      const result = [];
      reply.body.forEach((elem) => {
        delete elem.payload.uid;
        result.push(elem);
      });
      newElement.meta = oihMeta;
      newElement.data = result.body;
    } else if (reply.body.payload && reply.body.palyoad.uid) {
      oihMeta.recordUid = reply.body.payload.uid;
      delete reply.body.payload.uid;
      newElement.meta = oihMeta;
      newElement.data = reply.body.payload;
    }

    this.emit('data', newMessage(newElement));
  } catch (e) {
    console.error('ERROR: ', e);
    console.log('Oops! Error occurred');
    this.emit('error', e);
  }
}

module.exports = {
  process: processAction,
};
