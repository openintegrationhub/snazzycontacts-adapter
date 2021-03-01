const nock = require('nock');

const getPersonsSuccessful = nock('https://api.snazzycontacts.com/api/person?page=1')
  .get('')
  .reply(200, {
    data: [
      {
        _id: '5c9cfdebeecf6f05291ba6df',
        isUser: false,
        firstName: 'John',
        lastName: 'Doe',
        photo: 'www.photo.com/john',
        uid: '3gbdq1jtsvxjot',
        lastUpdate: '1555486295456',
        updatedAt: '2020-03-01T08:52:59.105Z',
        updateEvent: '3gbdk1jukwdmzk',
        meta: {
          role: 'USER',
          user: '5c7f8c5da3c613001042f618',
          tenant: '5c7f8c5ea3c613001042f619',
          username: 'johny@mail.com',
        },
        addresses: [
          {
            street: 'Main Str',
            streetNumber: '688',
            unit: '',
            zipcode: '57294',
            city: 'New York City',
            district: 'NY',
            region: '',
            country: 'USA',
            countryCode: '',
            primaryContact: '',
            description: '',
            uid: '3gbdq1jtswf2zw',
            categories: [
              {
                uid: 'yj5rl1jt4eiiry',
                label: 'Business',
              },
            ],
          },
        ],
        contactData: [
          {
            type: 'email',
            value: 'johny@mail.com',
            description: '',
            uid: '3gbdq1jtsvzg58',
            categories: [
              {
                uid: 'yj5rl1jt4eiiry',
                label: 'Business',
              },
            ],
          },
          {
            type: 'phone',
            value: '123456789',
            description: '',
            uid: '3gbdq1jtsvzrel',
            categories: [
              {
                uid: 'yj5rl1jt7j97qu',
                label: 'Friends',
              },
            ],
          },
          {
            type: 'linkedIn',
            value: 'test',
            description: '',
            uid: '3gbdk1jukwd8sd',
            categories: [
              {
                uid: 'yj5rl1jt7j97qu',
                label: 'Friends',
              },
            ],
          },
        ],
        categories: [
          {
            uid: 'yj5rl1jt7j93ww',
            label: 'Family',
          },
          {
            uid: 'yj5rl1jt7j9ce2',
            label: 'Office',
          },
        ],
        relations: [
          {
            partner: {
              uid: '3gbdq1jtss29zz',
              name: 'Wice GmbH',
              kind: 'Organization',
              addresses: [],
            },
            uids: [
              '3gbdq1jtss29zz',
              '3gbdq1jtsvxjot',
            ],
            label: 'Co-Founder',
            typeRef: 'yj5pv1jty0nywm',
            type: 'OrganizationToPerson',
            uid: 'yj5pv1jty0r99k',
          },
        ],
        __v: 0,
        lastUpdateBy: 'admin@wice.de',
        lastUpdateById: '5c7f8c5da3c613001042f618',
        salutation: 'Mr.',
        title: 'Mr.',
        middleName: 'Johny',
        displayName: 'John',
        birthday: '12.11.1981',
        gender: 'Male',
        nickname: '',
        jobTitle: 'Manager',
      }, {
        _id: '5c9ce5078590ee5430a39c2e',
        isUser: false,
        firstName: 'Steve ',
        lastName: 'Hobbs',
        photo: '',
        lastUpdate: '1555592465662',
        updatedAt: '2020-03-02T08:52:59.105Z',
        updateEvent: '3gbdk1jumnl8fx',
        meta: {
          role: 'USER',
          user: '5c7f8c5da3c613001042f618',
          tenant: '5c7f8c5ea3c613001042f619',
          username: 'steve@mail.de',
        },
        addresses: [
          {
            street: 'West Spring Street',
            streetNumber: '654',
            unit: '',
            zipcode: '432',
            city: 'San Fransico',
            district: 'CA',
            region: '',
            country: 'USA',
            countryCode: '',
            primaryContact: '',
            description: '',
            uid: '3gbdq1jtss7pq6',
            categories: [
              {
                uid: 'yj5rl1jt4eiiry',
                label: 'Business',
              },
            ],
          },
          {
            street: 'Main Street',
            streetNumber: '12',
            unit: '',
            zipcode: '543',
            city: 'San Jose',
            district: '',
            region: '',
            country: 'USA',
            countryCode: '',
            primaryContact: '',
            description: '',
            uid: '3gbdq1jtss7pq7',
            categories: [
              {
                uid: 'yj5rl1jt4eidgj',
                label: 'Private',
              },
            ],
          },
        ],
        contactData: [
          {
            type: 'email',
            value: 'steve@info.com',
            description: '',
            uid: '3gbdq1jtss6kc4',
            categories: [
              {
                uid: 'yj5rl1jt4eiiry',
                label: 'Business',
              },
            ],
          },
          {
            type: 'fax',
            value: '46866571',
            description: '',
            uid: '3gbdq1jtss6kc6',
            categories: [
              {
                uid: 'yj5rl1jt7j9g4z',
                label: 'School',
              },
            ],
          },
          {
            type: 'facebook',
            value: 'www.facebook.com/docker',
            description: '',
            uid: '3gbdq1jtss6kc7',
            categories: [
              {
                uid: 'yj5rl1jt7j97qu',
                label: 'Friends',
              },
            ],
          },
          {
            type: 'phone',
            value: '+456',
            description: '',
            uid: '3gbdk1jumnlsay',
            categories: [],
          },
        ],
        categories: [
          {
            uid: 'yj5rl1jt7j9ce2',
            label: 'Office',
          },
          {
            uid: 'yj5rl1jt4eiiry',
            label: 'Business',
          },
          {
            uid: 'yj5rl1jt7j97qu',
            label: 'Friends',
          },
          {
            uid: 'yj5rl1jt4eidgj',
            label: 'Private',
          },
        ],
        relations: [
          {
            partner: {
              uid: '3gbdq1jtss29zz',
              name: 'Conpany Ltd',
              kind: 'Organization',
              addresses: [],
            },
            uids: [
              '3gbdq1jtss29zz',
              '3gbdq1jtss4z07',
            ],
            label: 'CEO',
            typeRef: 'yj5rl1jt01l18b',
            type: 'OrganizationToPerson',
            uid: 'yj5pv1jtva0k0t',
          },
        ],
        __v: 0,
        lastUpdateBy: 'admin@wice.de',
        lastUpdateById: '5c7f8c5da3c613001042f618',
        middleName: 'Athony',
        salutation: 'Mr',
        title: 'Mr.',
        gender: 'Male',
        birthday: '22.12.1988',
        jobTitle: 'DevOps',
        nickname: 'Stevey',
        displayName: 'steve',
      },
    ],
    meta: {
      count: 10,
    },
  });

const getPersonsEmpty = nock('https://api.snazzycontacts.com/api/person')
  .get('')
  .reply(204, {});

const getOrganizationsSuccessful = nock('https://api.snazzycontacts.com/api/organization')
  .get('')
  .reply(200, {
    data: [{
      _id: '5b9a5113d76e887b8d59120a',
      name: 'Wice GmbH',
      logo: 'Logo',
      uid: '3gbbj1jmg24hmh',
      lastUpdate: '1553776079199',
      updatedAt: '2020-03-01T08:52:59.105Z',
      addresses: [
        {
          uid: '3gbbu1jmkewc87',
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
          description: 'Business Address',
        },
      ],
      _v: '1',
    },
    {
      _id: '5b9a5113d76e887b8d59120a',
      name: 'Company Ltd',
      logo: 'Logo',
      uid: '3ghj7ajmg24hmh',
      lastUpdate: '1553776079568',
      updatedAt: '2020-03-02T08:52:59.105Z',
      addresses: [
        {
          uid: '59po91jmkewc87',
          street: 'Main Str.',
          streetNumber: '320',
          unit: 'West Block',
          zipcode: '78900',
          city: 'New York City',
          district: 'New York',
          region: 'New York',
          country: 'USA',
          countryCode: '0010',
          primaryContact: 'true',
          description: 'Business Address',
        },
      ],
      contactData: [],
      categories: [],
      relations: [
        {
          partner: {
            uid: '3gbdq1jtsry748',
            name: 'Jenk Ins',
            kind: 'Person',
            addresses: [],
          },
          uids: [
            '3gbdq1jtss29zz',
            '3gbdq1jtsry748',
          ],
          label: 'Employee',
          typeRef: 'yj5rl1jszyqfn3',
          type: 'OrganizationToPerson',
          uid: '3gbdq1jtss31i0',
        }],
      _v: '1',
    }],
    meta: {
      count: 10,
    },
  });

const getOrganizationsEmpty = nock('https://api.snazzycontacts.com/api/organization')
  .get('')
  .reply(204, {});


module.exports = {
  getPersonsSuccessful,
  getPersonsEmpty,
  getOrganizationsSuccessful,
  getOrganizationsEmpty,
};
