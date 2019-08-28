const options = {
  json: {
    max_hits: 100,
  },
  headers: {
    'X-API-KEY': 'acilfogux3h4xv5cilhiqskr8xo6ghhh',
  },
};

const configOptions = {
  email: 'admin@example.com',
  password: 'somestring',
};

const organizations = [{
  body: {
    name: 'Company Ltd.',
    email: 'info@company.com',
  },
},
{
  body: {
    name: 'Test GmbH',
    email: 'info@testgmbh.com',
  },
},
{
  body: {
    name: 'Travel Mates',
    email: 'info@travelmates.com',
  },
},
];

const persons = [{
  body: {
    rowid: '25mop1jxq2ss3x',
    lastName: 'Brown',
    firstName: 'Adam',
  },
},
{
  body: {
    rowid: '123asd',
    lastName: 'Doe',
    firstName: 'John',
  },
},
{
  body: {
    rowid: '98hkp1jxq2ss3x',
    lastName: 'Kolarov',
    firstName: 'Sebastian',
    email: 'kolarov@mail.com',
  },
}, {
  body: {
    _id: '5d1f429dbbe76eeb57af028e',
    isUser: false,
    firstName: 'Mark',
    lastName: 'Smith',
    photo: 'https://cdn3.iconfinder.com/data/icons/ultimate-social/150/43_yahoo-512.png',
    uid: '25mop1jxq2ss3x',
    gender: 'male',
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
      username: 'mark.smith@yahoo.com',
    },
    addresses: [{
      street: 'Main Str.',
      streetNumber: '123',
      city: 'Hamburg',
    }],
    contactData: [
      {
        type: 'email',
        value: 'info@smith.com',
        description: 'public',
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
  },
},
{
  body: {
    _id: '5d1f429dbbe76eeb57af028e',
    isUser: false,
    firstName: 'Mark',
    lastName: 'Johnson',
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
      username: 'mark.smith@yahoo.com',
    },
    addresses: [{
      street: 'Some Str.',
      streetNumber: '456',
      city: 'Cologne',
    }],
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
  },
},
];

module.exports = {
  options,
  configOptions,
  persons,
  organizations,
};
