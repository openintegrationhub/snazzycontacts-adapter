const nock = require('nock');

const createPersonSuccessful = nock('http://api.snazzyapps.de/api/person')
  .post('')
  .reply(200, {
    eventId: 'yj5o81jvazco6v',
    eventName: 'PersonCreated',
    meta: {
      role: 'USER',
      user: '5c7f8c5da3c613001042f618',
      tenant: '5c7f8c5ea3c613001042f619',
      username: 'admin@wice.de',
    },
    timeStamp: 1557063409787,
    causalId: 0,
    payload: {
      firstName: 'John',
      lastName: 'Doe',
      uid: 'yj5o81jvazco6s',
      gender: '',
      jobTitle: '',
      nickname: '',
      displayName: '',
      middleName: '',
      salutation: '',
      title: '',
      birthday: '',
    },
  });

const createPersonFailed = nock('http://api.snazzyapps.de/api/person')
  .post('')
  .reply(400, 'Data does not match schema!');

const createOrganizationSuccessful = nock('http://api.snazzyapps.de/api/organization')
  .post('')
  .reply(200, {
    eventId: '3gbds1jvduhqiw',
    eventName: 'OrganizationCreated',
    meta: {
      role: 'USER',
      user: '5c7f8c5da3c613001042f618',
      tenant: '5c7f8c5ea3c613001042f619',
      username: 'admin@wice.de',
    },
    timeStamp: 1557236646537,
    causalId: 0,
    payload: {
      name: 'Wice GmbH',
      logo: 'Logo',
      addresses: [
        {
          street: 'Wendenstr',
          streetNumber: '120',
          unit: 'Hammerbrook',
          zipcode: '20537',
          city: 'Hamburg',
          district: 'HH-Hamburg',
          region: 'Hamburg',
          country: 'Germany',
          countryCode: '0049',
          primaryContact: 'true',
          description: 'Private Address',
          uid: '3gbds1jvduhqiu',
        },
      ],
      uid: '3gbds1jvduhqit',
    },
  });

const createOrganizationFailed = nock('http://api.snazzyapps.de/api/organization')
  .post('')
  .reply(400, 'Data does not match schema!');
