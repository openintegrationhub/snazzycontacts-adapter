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
  const oihUid = (msg.body.meta != undefined || msg.body.meta.oihUid != undefined) ? msg.body.meta.oihUid : 'oihUid not set yet';
  const recordUid = (msg.body != undefined || msg.body.uid != undefined) ? msg.body.uid : 'uid not set yet';
  const iamToken = process.env.ELASTICIO_IAM_TOKEN;

  async function emitData() {
    const getApplicationUidOptions = {
      uri: `http://component-repository.openintegrationhub.com/components/${process.env.ELASTICIO_COMP_ID}`,
      json: true,
      headers: {
        Authorization: `Bearer ${iamToken}`,
      },
    };

    // Make request to Component Repository API
    const applicationUidResponse = await request.get(getApplicationUidOptions);

    /** The following block creates the meta object.
     *  This meta object stores information which are later needed in order to make the hub and spoke architecture work properly
     */
    const { applicationUid } = applicationUidResponse.data;

    const { uid } = msg.body.meta;
    const newElement = {};
    const oihMeta = {
      applicationUid: (applicationUid != undefined || applicationUid != null) ? applicationUid : 'applicationUid not set yet',
      oihUid,
      recordUid,
    };
    let objectExists = false;
    let organizationObject = msg.body.data;
    if (uid && uid !== '' && uid !== 'undefined') {
      const cfmResponse = await resolve(msg, token, 'organization');

      if (cfmResponse) {
        organizationObject = cfmResponse.resolvedConflict;
        objectExists = cfmResponse.exists;
      }
    }

    const reply = await upsertObject(organizationObject, token, objectExists, 'organization');
    if (objectExists) {
      const result = [];
      reply.forEach((elem) => {
        delete elem.payload.uid;
        result.push(elem);
      });
      newElement.meta = oihMeta;
      newElement.data = result;
    } else {
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
