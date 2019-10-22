const nock = require('nock');

const createPersonSuccessful = nock('https://api.snazzycontacts.com/api/person')
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

const createPersonFailed = nock('https://api.snazzycontacts.com/api/person')
  .post('')
  .reply(400, 'Data does not match schema!');

const deletePersonSuccessful = nock('https://api.snazzycontacts.com/api/person/8sjwp1jvdhswq2')
  .delete('')
  .reply(200, {
    id: '3gbbk1jmq3nv5q',
    eventName: 'PersonDeleted',
    timeStamp: '1537791877918',
    meta: {
      role: 'TENANT_ADMIN',
      user: '5d945793728470011e122fa',
      tenant: '31d21937284700730d73j8',
      username: 'example@wice.de',
    },
    causalId: '0',
    payload: {
      uid: '8sjwp1jvdhswq2',
    },
  });

const deletePersonFailed = nock('https://api.snazzycontacts.com/api/person/')
  .delete('')
  .reply(400, 'Uid is not defined!');

const deletePersonNotFound = nock('https://api.snazzycontacts.com/api/person/111111')
  .delete('')
  .reply(204);

const createOrganizationSuccessful = nock('https://api.snazzycontacts.com/api/organization')
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

const createOrganizationFailed = nock('https://api.snazzycontacts.com/api/organization')
  .post('')
  .reply(400, 'Data does not match schema!');

const deleteOrganizationSuccessful = nock('https://api.snazzycontacts.com/api/organization/2jkwerjvdhswq2')
  .delete('')
  .reply(200, {
    id: '5dlkk1jmq3nv5q',
    eventName: 'OrganizationDeleted',
    timeStamp: '1537791877918',
    meta: {
      role: 'TENANT_ADMIN',
      user: '5d94573j7g37p0011e122fa',
      tenant: '31d2193hj384kl830d73j8',
      username: 'example@wice.de',
    },
    causalId: '0',
    payload: {
      uid: '2jkwerjvdhswq2',
    },
  });

const deleteOrganizationFailed = nock('https://api.snazzycontacts.com/api/organization/')
  .delete('')
  .reply(400, 'Uid is not defined!');

const deleteOrganizationNotFound = nock('https://api.snazzycontacts.com/api/organization/222222')
  .delete('')
  .reply(204);

const getPerson = nock('https://api.snazzycontacts.com/api/person/25mop1jxq2ss3x')
  .get('')
  .reply(200, {
    _id: '5d1f429dbbe76eeb57af028e',
    isUser: false,
    firstName: 'Yahoouser',
    lastName: 'Accountname',
    photo: 'https://cdn3.iconfinder.com/data/icons/ultimate-social/150/43_yahoo-512.png',
    uid: '25mop1jxq2ss3x',
    gender: '',
    jobTitle: '',
    nickname: '',
    displayName: '',
    middleName: '',
    salutation: '',
    title: '',
    birthday: '',
    lastUpdate: '1562409837891',
    updateEvent: '7q9m1jxreh6ir',
    meta: {
      role: 'USER',
      user: '5d1f42743805f3001257392e',
      tenant: '5d1f420d3805f3001257392d',
      username: 'admin@wice.de',
    },
    addresses: [],
    contactData: [],
    categories: [
      {
        uid: '25mop1jxq2pp3e',
        label: 'Customer',
      },
    ],
    relations: [],
    __v: 0,
    lastUpdateBy: null,
    lastUpdateById: null,
  });

const updatePerson = nock('https://api.snazzycontacts.com/api/person/25mop1jxq2ss3x')
  .put('')
  .reply(200, {
    eventId: 'o0d48u31jzxuwspc',
    eventName: 'PersonLastNameUpdated',
    meta: {
      role: 'USER',
      user: '5d1f420cf7a2170011747690',
      tenant: '5d1f420d3805f3001257392d',
      username: 'admin@wice.de',
    },
    timeStamp: 1567153802064,
    causalId: 0,
    payload: {
      uid: '25mop1jzwjc4by',
      lastName: 'Stevenson',
    },
  });

const personResolve = nock('https://api.snazzycontacts.com/api/person/902jf1jxq2ss3x')
  .get('')
  .reply(200, {
    _id: '83jd729dbbe76eeb57af028e',
    isUser: false,
    firstName: 'Jane',
    lastName: 'Brown',
    photo: 'https://cdn3.iconfinder.com/data/icons/ultimate-social/150/43_yahoo-512.png',
    uid: '902jf1jxq2ss3x',
    gender: 'female',
    jobTitle: '',
    nickname: '',
    displayName: '',
    middleName: '',
    salutation: '',
    title: '',
    birthday: '',
    lastUpdate: '1562409837891',
    updateEvent: '7q9m1jxreh6ir',
    meta: {
      role: 'USER',
      user: '5d1f42743805f3001257392e',
      tenant: '5d1f420d3805f3001257392d',
      username: 'jane.brown@yahoo.com',
    },
    addresses: [{
      street: 'Some Str.',
      streetNumber: '456',
      city: 'Cologne',
    }],
    contactData: [
      {
        type: 'phone',
        value: '123456',
        description: 'private',
      },
      {
        type: 'fax',
        value: '68790',
        description: 'private',
      },
    ],
    categories: [
      {
        uid: '25mop1jxq2pp3e',
        label: 'Customer',
      },
    ],
    relations: [],
    __v: 0,
    lastUpdateBy: null,
    lastUpdateById: null,
  });

const getPersonFailed = nock('https://api.snazzycontacts.com/api/person/123asd')
  .get('')
  .reply(204);

const getPersonNoToken = nock('https://api.snazzycontacts.com/api/person/98hkp1jxq2ss3x')
  .get('')
  .reply(401);

module.exports = {
  createPersonSuccessful,
  createPersonFailed,
  deletePersonSuccessful,
  deletePersonFailed,
  deletePersonNotFound,
  createOrganizationSuccessful,
  createOrganizationFailed,
  deleteOrganizationSuccessful,
  deleteOrganizationFailed,
  deleteOrganizationNotFound,
  updatePerson,
  getPerson,
  getPersonFailed,
  getPersonNoToken,
  personResolve,
};
