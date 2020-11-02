/* eslint no-unused-expressions: "off" */

const nock = require('nock');
const { expect } = require('chai');
const { getEntries } = require('../lib/utils/helpers');
const {
  getPersonsSuccessful, getPersonsEmpty, getOrganizationsSuccessful, getOrganizationsEmpty,
} = require('./seed/triggers.seed');

describe('Triggers - getPersons & getOrganizations', () => {
  let token;
  before(async () => {
    getPersonsSuccessful;
    getPersonsEmpty;
    getOrganizationsSuccessful;
    getOrganizationsEmpty;
  });

  it('should get all persons', async () => {
    const snapshot = {
      lastUpdated: (new Date(0)).getTime(),
    };
    const persons = await getEntries(token, snapshot, 'person');
    expect(persons.result).to.not.be.empty;
    expect(persons.result).to.be.a('array');
    expect(persons.result).to.have.length(2);
    expect(persons.result[0].firstName).to.equal('John');
    expect(persons.result[0].lastName).to.equal('Doe');
    expect(persons.result[0].photo).to.equal('www.photo.com/john');
    expect(persons.result[0].addresses[0].street).to.equal('Main Str');
    expect(persons.result[0].addresses[0].streetNumber).to.equal('688');
    expect(persons.result[0].addresses[0].city).to.equal('New York City');
    expect(persons.result[0].contactData[0].value).to.equal('johny@mail.com');
    expect(persons.result[0].contactData[2].type).to.equal('linkedIn');
  });

  it('should throw an exception if no persons were found', async () => {
    const snapshot = {
      lastUpdated: 0,
    };
    const persons = await getEntries(token, snapshot, 'person');
    expect(persons).to.equal('Expected records array.');
  });

  it('should get all organizations', async () => {
    const snapshot = {
      lastUpdated: (new Date(0)).getTime(),
    };
    const organizations = await getEntries(token, snapshot, 'organization');
    expect(organizations.result).to.not.be.empty;
    expect(organizations.result).to.be.a('array');
    expect(organizations.result).to.have.length(2);
    expect(organizations.result[1].name).to.equal('Company Ltd');
    expect(organizations.result[1].logo).to.equal('Logo');
    expect(organizations.result[1].uid).to.equal('3ghj7ajmg24hmh');
    expect(organizations.result[1].lastUpdate).to.equal('1553776079568');
    expect(organizations.result[1].addresses[0].street).to.equal('Main Str.');
    expect(organizations.result[1].addresses[0].streetNumber).to.equal('320');
    expect(organizations.result[1].addresses[0].city).to.equal('New York City');
    expect(organizations.result[1].contactData).to.be.a('array');
    expect(organizations.result[1].contactData).to.be.empty;
    expect(organizations.result[1].relations[0].partner.uid).to.equal('3gbdq1jtsry748');
    expect(organizations.result[1].relations[0].partner.kind).to.equal('Person');
    expect(organizations.result[1].relations[0].partner.name).to.equal('Jenk Ins');
    expect(organizations.result[1].relations[0].uids).to.be.a('array');
    expect(organizations.result[1].relations[0].uids[0]).to.equal('3gbdq1jtss29zz');
    expect(organizations.result[1].relations[0].uids[1]).to.equal('3gbdq1jtsry748');
    expect(organizations.result[1].relations[0].label).to.equal('Employee');
    expect(organizations.result[1].relations[0].type).to.equal('OrganizationToPerson');
  });

  it('should throw an exception if no organizations were found', async () => {
    const snapshot = {
      lastUpdated: 0,
    };
    const organizations = await getEntries(token, snapshot, 'organization');
    expect(organizations).to.equal('Expected records array.');
  });

  it.only('should search for persons', async () => {
    nock('https://api.snazzycontacts.com/api/search')
      .get('')
      .query(
        {
          term: 'John',
          num: 1000,
        },
      )
      .reply(200, [
        3,
        [
          {
            firstName: 'John',
            lastName: 'Doe',
            title: '',
            'addresses.0.street': 'Privatstraße',
            'addresses.0.streetNumber': '7',
            'addresses.0.city': 'Hamburg',
            'addresses.0.uid': '1di551k731f6yh',
            'addresses.0.zipcode': '12345',
            'addresses.1.street': 'AndereStraße',
            'addresses.1.streetNumber': '7',
            'addresses.1.city': 'Hamburg',
            'addresses.1.uid': '1di551k731f6yh',
            'addresses.1.zipcode': '876544',
            'contactData.0.type': 'email',
            'contactData.0.value': 'jdoe@gmail.com',
            'contactData.0.uid': '1di551k731f6yi',
            'contactData.1.type': 'mobil',
            'contactData.1.value': '+49 69 123456',
            'contactData.1.description': '',
            'contactData.1.contextRef': '',
            'contactData.1.uid': '1di551k7diekvd',
            'contactData.2.type': 'phone',
            'contactData.2.value': '+49 40 654321',
            'contactData.2.description': '',
            'contactData.2.contextRef': '',
            'contactData.2.uid': '1di551k7diekve',
            'contactData.2.categories.0.0.isUser': 'false',
            'contactData.2.categories.1.0.uid': 'jhpgymi1k3ebtk1l',
            'contactData.2.categories.2.0.label': 'Private',
            'contactData.3.type': 'email',
            'contactData.3.value': 'jd@doe.de',
            'contactData.3.contextRef': '1di551k731ixiy',
            'contactData.3.uid': '1di551k7dihokn',
            'contactData.4.type': 'phone',
            'contactData.4.value': '+49 40 654321',
            'contactData.4.contextRef': '1di551k731ixiy',
            'contactData.4.uid': '1di551k7dihoko',
            'contactData.5.type': 'mobil',
            'contactData.5.value': '+49 160 123456',
            'contactData.5.contextRef': '1di551k731ixiy',
            'contactData.5.uid': '1di551k7dihokp',
            'contactData.6.type': 'xing',
            'contactData.6.value': 'https://www.xing.com/profile/John_Doe/cv',
            'contactData.6.description': '',
            'contactData.6.contextRef': '1di551k731ixiy',
            'contactData.6.uid': '1di551k7dihokq',
            'contactData.7.type': 'website',
            'contactData.7.value': 'https://doecorp.de',
            'contactData.7.description': '',
            'contactData.7.contextRef': '1di551k731ixiy',
            'contactData.7.uid': '1di551k7diif1x',
            'contactData.7.categories.0.0.isUser': 'false',
            'contactData.7.categories.1.0.uid': 'jhpgymi1k3ectr22',
            'contactData.7.categories.2.0.label': 'Business',
            'contactData.8.type': 'twitter',
            'contactData.8.value': 'https://twitter.com/jdoe',
            'contactData.8.description': '',
            'contactData.8.contextRef': '1di551k731ixiy',
            'contactData.8.uid': 'h17i51kckjgpxj',
            uid: '1di551k731f6yg',
            gender: '',
            jobTitle: '',
            nickname: '',
            displayName: '',
            middleName: '',
            salutation: '',
            birthday: '',
            photo: '',
            'meta.role': 'TENANT_ADMIN',
            'meta.user': '5de4c83450fb8e001119c103',
            'meta.tenant': '5ddbb5c950fb8e001119c0f1',
            timestamp: 1603266560693,
            'contactData.0.email': 'jdoe@gmail.com',
            'contactData.1.numericMobil': '004916093855685',
            'contactData.2.numericPhone': '004940315163',
            'contactData.3.email': 'jd@doe.de',
            'contactData.4.numericPhone': '0049404130350',
            'contactData.5.numericMobil': '004916093855685',
            'contactData.6.xing': 'https://www.xing.com/profile/Juergen_Schuessler/cv',
            'contactData.7.website': 'https://doecorp.de',
            'contactData.8.twitter': 'https://twitter.com/jdoe',
            _version_: 1681146837167243300,
          },
          {
            firstName: 'John',
            lastName: 'NotDoe',
            'contactData.0.type': 'email',
            'contactData.0.value': 'jd@ndoe.de',
            'contactData.0.uid': '1di551k7dhvww9',
            'contactData.1.type': 'mobil',
            'contactData.1.value': '+49 160 0986342',
            'contactData.1.description': '',
            'contactData.1.contextRef': '',
            'contactData.1.uid': '1di551k7dix855',
            'contactData.1.categories.0.0.isUser': 'false',
            'contactData.1.categories.1.0.uid': 'jhpgymi1k3ectr22',
            'contactData.1.categories.2.0.label': 'Business',
            uid: '1di551k7dhvww8',
            gender: '',
            jobTitle: '',
            nickname: '',
            displayName: '',
            middleName: '',
            salutation: '',
            title: '',
            birthday: '',
            'addresses.0.street': 'Doestreet',
            'addresses.0.streetNumber': '7',
            'addresses.0.unit': '',
            'addresses.0.zipcode': '12345',
            'addresses.0.city': 'Doecity',
            'addresses.0.district': '',
            'addresses.0.region': '',
            'addresses.0.country': 'Germany',
            'addresses.0.countryCode': '',
            'addresses.0.primaryContact': '',
            'addresses.0.description': '',
            'addresses.0.contextRef': '',
            'addresses.0.uid': '1di551k7dixw2j',
            'meta.role': 'USER',
            'meta.user': '5e5fcd9c9c293400116d77de',
            'meta.tenant': '5ddbb5c950fb8e001119c0f1',
            'categories.0.isUser': 'false',
            _categories_: [
              'false',
              'jhpgymi1k3ebtjt3',
              'User',
            ],
            'categories.0.uid': 'jhpgymi1k3ebtjt3',
            'categories.0.label': 'User',
            timestamp: 1603266560693,
            'contactData.0.email': 'js@wice.de',
            'contactData.1.numericMobil': '004916093855685',
            _version_: 1681146837158854700,
            zipcode_numeric: [
              21129,
            ],
          },
          {
            name: 'John Corp',
            logo: 'logo.jpg',
            timestamp: 1603266560693,
          },
        ],
      ]);

    const snapshot = {
      lastUpdated: (new Date(0)).getTime(),
    };
    const persons = await getEntries('someToken', snapshot, 'person', false, 'John');

    expect(persons.result).to.have.lengthOf(2);
    expect(persons.result[0].firstName).to.equal('John');
    expect(persons.result[0].lastName).to.equal('Doe');
    expect(persons.result[0].contactData).to.have.lengthOf(9);
    expect(persons.result[0].addresses).to.have.lengthOf(2);
    expect(persons.result[1].firstName).to.equal('John');
    expect(persons.result[1].lastName).to.equal('NotDoe');
    expect(persons.result[1].contactData).to.have.lengthOf(2);
    expect(persons.result[1].addresses).to.have.lengthOf(1);
  });

  it.only('should search for organizations', async () => {
    nock('https://api.snazzycontacts.com/api/search')
      .get('')
      .query(
        {
          term: 'John',
          num: 1000,
        },
      )
      .reply(200, [
        3,
        [
          {
            firstName: 'John',
            lastName: 'Doe',
            title: '',
            'addresses.0.street': 'Privatstraße',
            'addresses.0.streetNumber': '7',
            'addresses.0.city': 'Hamburg',
            'addresses.0.uid': '1di551k731f6yh',
            'addresses.0.zipcode': '12345',
            'addresses.1.street': 'AndereStraße',
            'addresses.1.streetNumber': '7',
            'addresses.1.city': 'Hamburg',
            'addresses.1.uid': '1di551k731f6yh',
            'addresses.1.zipcode': '876544',
            'contactData.0.type': 'email',
            'contactData.0.value': 'jdoe@gmail.com',
            'contactData.0.uid': '1di551k731f6yi',
            'contactData.1.type': 'mobil',
            'contactData.1.value': '+49 69 123456',
            'contactData.1.description': '',
            'contactData.1.contextRef': '',
            'contactData.1.uid': '1di551k7diekvd',
            'contactData.2.type': 'phone',
            'contactData.2.value': '+49 40 654321',
            'contactData.2.description': '',
            'contactData.2.contextRef': '',
            'contactData.2.uid': '1di551k7diekve',
            'contactData.2.categories.0.0.isUser': 'false',
            'contactData.2.categories.1.0.uid': 'jhpgymi1k3ebtk1l',
            'contactData.2.categories.2.0.label': 'Private',
            'contactData.3.type': 'email',
            'contactData.3.value': 'jd@doe.de',
            'contactData.3.contextRef': '1di551k731ixiy',
            'contactData.3.uid': '1di551k7dihokn',
            'contactData.4.type': 'phone',
            'contactData.4.value': '+49 40 654321',
            'contactData.4.contextRef': '1di551k731ixiy',
            'contactData.4.uid': '1di551k7dihoko',
            'contactData.5.type': 'mobil',
            'contactData.5.value': '+49 160 123456',
            'contactData.5.contextRef': '1di551k731ixiy',
            'contactData.5.uid': '1di551k7dihokp',
            'contactData.6.type': 'xing',
            'contactData.6.value': 'https://www.xing.com/profile/John_Doe/cv',
            'contactData.6.description': '',
            'contactData.6.contextRef': '1di551k731ixiy',
            'contactData.6.uid': '1di551k7dihokq',
            'contactData.7.type': 'website',
            'contactData.7.value': 'https://doecorp.de',
            'contactData.7.description': '',
            'contactData.7.contextRef': '1di551k731ixiy',
            'contactData.7.uid': '1di551k7diif1x',
            'contactData.7.categories.0.0.isUser': 'false',
            'contactData.7.categories.1.0.uid': 'jhpgymi1k3ectr22',
            'contactData.7.categories.2.0.label': 'Business',
            'contactData.8.type': 'twitter',
            'contactData.8.value': 'https://twitter.com/jdoe',
            'contactData.8.description': '',
            'contactData.8.contextRef': '1di551k731ixiy',
            'contactData.8.uid': 'h17i51kckjgpxj',
            uid: '1di551k731f6yg',
            gender: '',
            jobTitle: '',
            nickname: '',
            displayName: '',
            middleName: '',
            salutation: '',
            birthday: '',
            photo: '',
            'meta.role': 'TENANT_ADMIN',
            'meta.user': '5de4c83450fb8e001119c103',
            'meta.tenant': '5ddbb5c950fb8e001119c0f1',
            timestamp: 1603266560693,
            'contactData.0.email': 'jdoe@gmail.com',
            'contactData.1.numericMobil': '004916093855685',
            'contactData.2.numericPhone': '004940315163',
            'contactData.3.email': 'jd@doe.de',
            'contactData.4.numericPhone': '0049404130350',
            'contactData.5.numericMobil': '004916093855685',
            'contactData.6.xing': 'https://www.xing.com/profile/Juergen_Schuessler/cv',
            'contactData.7.website': 'https://doecorp.de',
            'contactData.8.twitter': 'https://twitter.com/jdoe',
            _version_: 1681146837167243300,
          },
          {
            firstName: 'John',
            lastName: 'NotDoe',
            'contactData.0.type': 'email',
            'contactData.0.value': 'jd@ndoe.de',
            'contactData.0.uid': '1di551k7dhvww9',
            'contactData.1.type': 'mobil',
            'contactData.1.value': '+49 160 0986342',
            'contactData.1.description': '',
            'contactData.1.contextRef': '',
            'contactData.1.uid': '1di551k7dix855',
            'contactData.1.categories.0.0.isUser': 'false',
            'contactData.1.categories.1.0.uid': 'jhpgymi1k3ectr22',
            'contactData.1.categories.2.0.label': 'Business',
            uid: '1di551k7dhvww8',
            gender: '',
            jobTitle: '',
            nickname: '',
            displayName: '',
            middleName: '',
            salutation: '',
            title: '',
            birthday: '',
            'addresses.0.street': 'Doestreet',
            'addresses.0.streetNumber': '7',
            'addresses.0.unit': '',
            'addresses.0.zipcode': '12345',
            'addresses.0.city': 'Doecity',
            'addresses.0.district': '',
            'addresses.0.region': '',
            'addresses.0.country': 'Germany',
            'addresses.0.countryCode': '',
            'addresses.0.primaryContact': '',
            'addresses.0.description': '',
            'addresses.0.contextRef': '',
            'addresses.0.uid': '1di551k7dixw2j',
            'meta.role': 'USER',
            'meta.user': '5e5fcd9c9c293400116d77de',
            'meta.tenant': '5ddbb5c950fb8e001119c0f1',
            'categories.0.isUser': 'false',
            _categories_: [
              'false',
              'jhpgymi1k3ebtjt3',
              'User',
            ],
            'categories.0.uid': 'jhpgymi1k3ebtjt3',
            'categories.0.label': 'User',
            timestamp: 1603266560693,
            'contactData.0.email': 'js@wice.de',
            'contactData.1.numericMobil': '004916093855685',
            _version_: 1681146837158854700,
            zipcode_numeric: [
              21129,
            ],
          },
          {
            name: 'John Corp',
            logo: 'logo.jpg',
            timestamp: 1603266560693,
          },
        ],
      ]);

    const snapshot = {
      lastUpdated: (new Date(0)).getTime(),
    };
    const persons = await getEntries('someToken', snapshot, 'organization', false, 'John');

    expect(persons.result).to.have.lengthOf(1);
    expect(persons.result[0].name).to.equal('John Corp');
    expect(persons.result[0].logo).to.equal('logo.jpg');
  });
});
