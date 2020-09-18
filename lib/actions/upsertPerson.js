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

const { resolve } = require('./../utils/resolver');
const {
  upsertObject, fetchUidFromReference, populateRelations, newMessage,
} = require('./../utils/helpers');
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
    const self = this;
    const oihUid = (msg.body.meta !== undefined && msg.body.meta.oihUid !== undefined) ? msg.body.meta.oihUid : 'oihUid not set yet';
    let recordUid = (msg.body !== undefined && msg.body.meta.recordUid !== undefined) ? msg.body.meta.recordUid : undefined;
    const applicationUid = (msg.body.meta !== undefined && msg.body.meta.applicationUid !== undefined) ? msg.body.meta.applicationUid : undefined;

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
    let personObject = msg.body.data;

    if (recordUid && recordUid !== '' && recordUid !== 'undefined') {
      // If option is set, insert reference for snazzy ref management instead of using cfm
      if (cfg.sourceApp) {
        const fetchResponse = await fetchUidFromReference(cfg.sourceApp, recordUid, token, 'person', cfg.devMode);

        recordUid = fetchResponse.recordUid;  // eslint-disable-line
        objectExists = fetchResponse.objectExists; // eslint-disable-line

        if (!objectExists) {
          if (personObject.contactData) {
            personObject.contactData.push({ type: `reference:${cfg.sourceApp}`, value: String(recordUid) });
          } else {
            personObject.contactData = [{ type: `reference:${cfg.sourceApp}`, value: String(recordUid) }];
          }
        }

        personObject = await populateRelations(personObject, cfg, token);
      } else {
        // Conflict Management implementation
        const cfmResponse = await resolve(msg, token, 'person');

        if (cfmResponse) {
          personObject = cfmResponse.resolvedConflict;
          objectExists = cfmResponse.exists;
        }
      }
    }

    // Upsert the object depending on 'objectExists' property
    const reply = await upsertObject(personObject, token, objectExists, 'person', recordUid, cfg.devMode);

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

    self.emit('data', newMessage(newElement));
  } catch (e) {
    console.error('ERROR: ', e);
    console.log('Oops! Error occurred');
    self.emit('error', e);
  }
}

module.exports = {
  process: processAction,
};
