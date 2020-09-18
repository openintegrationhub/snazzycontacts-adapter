/* eslint "max-len":  ["error", { "code": 170 }] */
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

// const jsonata = require('jsonata');

module.exports.getExpression = (msg) => {
  if (Object.keys(msg.body).length === 0 && msg.body.constructor === Object) {
    return msg.body;
  }

  // const exp = '$map($$, function ($outer) {$outer})';
  // const jsonataExp = jsonata(exp);
  // const addresses = jsonataExp.evaluate(msg.body.data.addresses);
  // const contactData = jsonataExp.evaluate(msg.body.data.contactData);
  const contactData = [];
  const addresses = [];

  if (msg.body.data.contactData) {
    for (let i = 0; i < msg.body.data.contactData.length; i += 1) {
      const cd = msg.body.data.contactData[i];
      delete cd.categories;
      delete cd.contextRef;
      delete cd.uid;
      contactData.push(cd);
    }
  }

  if (msg.body.data.addresses) {
    for (let j = 0; j < msg.body.data.addresses.length; j += 1) {
      const adr = msg.body.data.addresses[j];
      delete adr.categories;
      delete adr.contextRef;
      delete adr.uid;
      addresses.push(adr);
    }
  }


  const expression = {
    meta: {
      recordUid: msg.body.meta.recordUid,
      operation: msg.body.operation,
      applicationUid: (msg.body.meta.applicationUid !== undefined && msg.body.meta.applicationUid !== null) ? msg.body.meta.applicationUid : 'appUid not set yet',
      iamToken: (msg.body.meta.iamToken !== undefined && msg.body.meta.iamToken !== null) ? msg.body.meta.iamToken : undefined,
      domainId: (msg.body.meta.domainId !== undefined && msg.body.meta.domainId !== null) ? msg.body.meta.domainId : undefined,
      schema: (msg.body.meta.schema !== undefined && msg.body.meta.schema !== null) ? msg.body.meta.schema : undefined,
    },
    data: {
      name: msg.body.data.name,
      logo: msg.body.data.logo,
      contactData,
      addresses,
    },
  };

  // Remove null values
  Object.keys(expression.data).forEach(
    key => (expression.data[key] == null || expression.data[key] === undefined)
  && delete expression.data[key],
  );
  return expression;
};
