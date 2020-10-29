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

module.exports.personFromOih = (msg) => {
  if (Object.keys(msg).length === 0 && msg.constructor === Object) {
    return msg;
  }

  const expression = {
    metadata: {
      operation: msg.operation,
      oihUid: msg.metadata.oihUid ? msg.metadata.oihUid : '',
      applicationUid: msg.metadata.applicationUid ? msg.metadata.applicationUid : '',
      iamToken: msg.metadata.iamToken ? msg.metadata.iamToken : undefined,
      recordUid: msg.metadata.recordUid,
    },
    data: {
      firstName: msg.data.firstName,
      lastName: msg.data.lastName,
      title: msg.data.title,
      jobTitle: msg.data.jobTitle,
      salutation: msg.data.salutation,
      gender: msg.data.gender,
      birthday: msg.data.birthday,
      displayName: msg.data.displayName,
      middleName: msg.data.middleName,
      nickname: msg.data.nickname,
      photo: msg.data.photo,
      addresses: msg.data.addresses,
      contactData: msg.data.contactData,
      relations: msg.data.relations,
    },
  };

  // Remove null values
  Object.keys(expression.data).forEach(
    key => (expression.data[key] == null || expression.data[key] === undefined)
  && delete expression.data[key],
  );

  // Remove value-less array items
  if (expression.contactData) expression.contactData.filter(cd => cd.value);
  if (expression.addresses) expression.addresses.filter(adr => Object.keys(adr).length > 0);

  return expression;
};
