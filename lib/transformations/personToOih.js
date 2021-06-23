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

module.exports.personToOih = (msg) => {
  if (Object.keys(msg).length === 0 && msg.constructor === Object) {
    return msg;
  }

  const contactData = [];
  const addresses = [];
  const categories = [];

  if (msg.data.contactData) {
    for (let i = 0; i < msg.data.contactData.length; i += 1) {
      const cd = msg.data.contactData[i];
      delete cd.categories;
      delete cd.contextRef;
      delete cd.uid;
      if (cd.type === 'mobil') cd.type = 'mobile';
      contactData.push(cd);
    }
  }

  if (msg.data.addresses) {
    for (let j = 0; j < msg.data.addresses.length; j += 1) {
      const adr = msg.data.addresses[j];
      delete adr.categories;
      delete adr.contextRef;
      delete adr.uid;
      addresses.push(adr);
    }
  }

  if (msg.data.categories) {
    for (let i = 0; i < msg.data.categories.length; i += 1) {
      if (msg.data.categories[i] && msg.data.categories[i].label) {
        categories.push(msg.data.categories[i].label);
      }
    }
  }

  const expression = {
    metadata: {
      recordUid: msg.metadata.recordUid,
      operation: msg.operation,
      applicationUid: (msg.metadata.applicationUid !== undefined && msg.metadata.applicationUid !== null) ? msg.metadata.applicationUid : 'appUid not set yet',
      iamToken: (msg.metadata.iamToken !== undefined && msg.metadata.iamToken !== null) ? msg.metadata.iamToken : undefined,
      domainId: (msg.metadata.domainId !== undefined && msg.metadata.domainId !== null) ? msg.metadata.domainId : undefined,
      schema: (msg.metadata.schema !== undefined && msg.metadata.schema !== null) ? msg.metadata.schema : undefined,
    },
    data: {
      firstName: msg.data.firstName,
      lastName: msg.data.lastName,
      title: msg.data.title,
      photo: msg.data.photo,
      jobTitle: msg.data.jobTitle,
      salutation: msg.data.salutation,
      gender: msg.data.gender,
      birthday: msg.data.birthday,
      displayName: msg.data.displayName,
      middleName: msg.data.middleName,
      nickname: msg.data.nickname,
      contactData,
      addresses,
      categories,
    },
  };

  // Remove null values
  Object.keys(expression.data).forEach(
    key => (expression.data[key] == null || expression.data[key] === undefined)
  && delete expression.data[key],
  );

  return expression;
};
