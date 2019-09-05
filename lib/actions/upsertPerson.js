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
const { resolve } = require('./../utils/resolver');
const upsertObject = require('./../utils/helpers');

/**
 * This method will be called from OIH platform providing following data
 *
 * @param {Object} msg - incoming message object that contains ``body`` with payload
 * @param {Object} cfg - configuration that is account information and configuration field values
 */
async function processAction(msg, cfg) {
  const token = await getToken(cfg);
  const self = this;
  const appUid = process.env.AppUid;
  const oihUid = (msg.body.meta != undefined && msg.body.meta.oihUidEncrypted != undefined) ? msg.body.meta.oihUidEncrypted : 'oihUidEncrypted not set yet';
  const recordUid = (msg.body.meta != undefined && msg.body.meta.recordUid != undefined) ? msg.body.meta.recordUid : 'recordUid not set yet';

  async function emitData() {
    // TODO:
    console.log('META: ', msg.body);
    const uid = msg.body.meta.recordUid;
    const newElement = {};
    const oihMeta = {
      applicationUid: (appUid != undefined && appUid != null) ? appUid : 'appUid not set yet',
      oihUidEncrypted: oihUid,
      recordUid,
    };
    let objectExists = false;
    let personObject = msg;

    if (uid && uid !== '' && uid !== 'undefined') {
      const cfmResponse = await resolve(msg, token, 'person');

      if (cfmResponse) {
        personObject = cfmResponse.resolvedConflict;
        objectExists = cfmResponse.exists;
      }
    }

    const reply = await upsertObject(personObject, token, objectExists, 'person');

    if (objectExists) {
      console.log('OBJECT DOES EXIST!');
      // TODO only for update

      const result = [];
      reply.forEach((elem) => {
        delete elem.payload.uid;
        result.push(elem);
      });
      newElement.meta = oihMeta;
      newElement.data = reply.result;
    } else {
      console.log('OBJECT DOES NOT EXIST!');
      oihMeta.recordUid = reply.payload.uid;
      delete reply.payload.uid;
      newElement.meta = oihMeta;
      newElement.data = reply.payload;
    }

    const data = messages.newMessageWithBody(newElement);

    self.emit('data', data);
  }

  function emitError(e) {
    console.log('Oops! Error occurred');
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

module.exports = {
  process: processAction,
};
