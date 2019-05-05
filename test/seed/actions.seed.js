const nock = require('nock');

const createPersonSuccessful = nock('http://canary-api.snazzyapps.de/api/person')
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
