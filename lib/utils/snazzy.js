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

const request = require('request-promise');

const BASE_URI = 'http://canary-api.snazzyapps.de/api/iam/login';

async function getToken(config) {
  const getTokenOptions = {
    uri: `${BASE_URI}`,
    headers: {
      json: true,
    },
  };

  try {
    const tokenRequest = await request.post(getTokenOptions);
    const { token } = tokenRequest;
    console.log('TOKEN: ', token);
    return token;
  } catch (e) {
    console.log(`ERROR: ${e}`);
    throw new Error(e);
  }
}

module.exports = {
  getToken,
};
