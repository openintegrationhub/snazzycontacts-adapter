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

const Q = require('q');
const { messages } = require('elasticio-node');
const { resolve } = require('./../utils/resolver');
const { upsertObject } = require('./../utils/helpers');
const { getToken } = require('./../utils/authentication');

/**
 * This method will be called from OIH platform providing following data
 *
 * @param {Object} msg - incoming message object that contains ``body`` with payload
 * @param {Object} cfg - configuration that is account information and configuration field values
 */
async function processAction(msg, cfg) {
  const token = await getToken(cfg);
  const self = this;
  const oihUid = (msg.body.meta !== undefined && msg.body.meta.oihUid !== undefined) ? msg.body.meta.oihUid : 'oihUid not set yet';
  const recordUid = (msg.body !== undefined && msg.body.uid !== undefined) ? msg.body.uid : 'uid not set yet';
  const applicationUid = (msg.body.meta !== undefined && msg.body.meta.applicationUid !== undefined) ? msg.body.meta.applicationUid : undefined;

  async function emitData() {
    /** Create an OIH meta object which is required
    *   to make the Hub and Spoke architecture work properly
    */
    const { uid } = msg.body.meta;
    const newElement = {};
    const oihMeta = {
      applicationUid,
      oihUid,
      recordUid,
    };

    let objectExists = false;
    let personObject = msg.body.data;

    if (uid && uid !== '' && uid !== 'undefined') {
      // Conflict Management implementation
      const cfmResponse = await resolve(msg, token, 'person');

      if (cfmResponse) {
        personObject = cfmResponse.resolvedConflict;
        objectExists = cfmResponse.exists;
      }
    }

    // Upsert the object depending on 'objectExists' property
    const reply = await upsertObject(personObject, token, objectExists, 'person', msg.body.meta);
    if (objectExists) {
      const result = [];
      reply.body.forEach((elem) => {
        delete elem.payload.uid;
        result.push(elem);
      });
      newElement.meta = oihMeta;
      newElement.data = result.body;
    } else {
      oihMeta.recordUid = reply.body.payload.uid;
      delete reply.body.payload.uid;
      newElement.meta = oihMeta;
      newElement.data = reply.body.payload;
    }

    self.emit('data', messages.newMessageWithBody(newElement));
  }

  /**
   * This method will be called from OIH platform if an error occured
   *
   * @param e - object containg the error
   */
  function emitError(e) {
    console.log('Oops! Error occurred');
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

module.exports = {
  process: processAction,
};
