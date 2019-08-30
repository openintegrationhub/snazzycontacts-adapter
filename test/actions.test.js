const { expect } = require('chai');
const { getToken } = require('./../lib/utils/snazzy');
const { upsertPerson } = require('./../lib/actions/upsertPerson.js');

const {
  resolve,
  checkForExistingUser,
  resolveConflict,
} = require('./../lib/utils/resolver.js');

const { upsertOrganization } = require('./../lib/actions/upsertOrganization.js');
const {
  createPersonSuccessful,
  createPersonFailed,
  createOrganizationSuccessful,
  createOrganizationFailed,
  updatePerson,
  getPerson,
  getPersonFailed,
  getPersonNoToken,
} = require('./seed/actions.seed');
const { persons, organizations } = require('./seed/seed');

describe('Actions - upsertPerson & upsertOrganization', () => {
  const token = 'WXYUFOmgDdoniZatfaMTa4Ov-An98v2-4668x5fXOoLZS';
  before(async () => {
    createPersonSuccessful;
    createPersonFailed;
    createOrganizationSuccessful;
    createOrganizationFailed;
    updatePerson;
    getPerson;
    getPersonFailed;
    getPersonNoToken;
  });

  xit('should ...........', async () => {
    const res = await resolve(persons[3], token);
    console.log(res);
  });

  it('should resolve a conflict', async () => {
    const res = resolveConflict(persons[3], persons[4]);
    expect(res.firstName).to.equal('Mark');
    expect(res.lastName).to.equal('Smith');
    expect(res.uid).to.equal('25mop1jxq2ss3x');
    expect(res.gender).to.equal('male');
    expect(res.meta).to.be.a('object');
    expect(res.addresses[0].street).to.equal('Some Str.');
    expect(res.addresses.length).to.equal(2);
    expect(res.contactData.length).to.equal(3);
    expect(res.categories.length).to.equal(3);
    expect(res.relations.length).to.equal(0);
  });

  it('should check for an existing person', async () => {
    const res = await checkForExistingUser(persons[0], token);
    expect(res.firstName).to.equal('Yahoouser');
    expect(res.lastName).to.equal('Accountname');
    expect(res.uid).to.equal('25mop1jxq2ss3x');
    expect(res.gender).to.equal('');
    expect(res.meta).to.be.a('object');
    expect(res.addresses.length).to.equal(0);
    expect(res.contactData.length).to.equal(0);
    expect(res.categories.length).to.equal(1);
    expect(res.relations.length).to.equal(0);
  });

  it('should return false if response is undefined', async () => {
    const res = await checkForExistingUser(persons[1], token);
    expect(res).to.be.false;
  });

  it('should return false if token is undefined', async () => {
    const res = await checkForExistingUser(persons[2], undefined);
    expect(res).to.be.false;
  });

  it('should create a person', async () => {
    const person = await upsertPerson(persons[0], token, false);
    expect(person).to.not.be.empty;
    expect(person).to.be.a('object');
    expect(person.eventName).to.equal('PersonCreated');
    expect(person.meta.role).to.equal('USER');
    expect(person.meta.username).to.equal('admin@wice.de');
    expect(person.payload.firstName).to.equal('John');
    expect(person.payload.lastName).to.equal('Doe');
  });

  it('should update a person', async () => {
    const person = await upsertPerson(persons[4], token, true);
    expect(person).to.not.be.empty;
    expect(person).to.be.a('object');
    expect(person.eventName).to.equal('PersonLastNameUpdated');
    expect(person.meta.role).to.equal('USER');
    expect(person.meta.username).to.equal('admin@wice.de');
    expect(person.payload.uid).to.equal('25mop1jzwjc4by');
    expect(person.payload.lastName).to.equal('Stevenson');
  });

  it('should throw an exception if input does not match models', async () => {
    const input = {
      body: {
        uid: '5h4k3j23211',
        firstName: 'Jane',
        lastName: 'Smith',
      },
    };
    const person = await upsertPerson(input, token, false);
    expect(person.statusCode).to.be.equal(400);
    expect(person.error).to.be.equal('Data does not match schema!');
  });

  it('should create an organization', async () => {
    const organization = await upsertOrganization(organizations[0], token);
    expect(organization).to.not.be.empty;
    expect(organization).to.be.a('object');
    expect(organization.eventName).to.equal('OrganizationCreated');
    expect(organization.meta.role).to.equal('USER');
    expect(organization.meta.username).to.equal('admin@wice.de');
    expect(organization.payload.name).to.equal('Wice GmbH');
    expect(organization.payload.logo).to.equal('Logo');
  });

  it('should throw an exception if input does not match models', async () => {
    const input = {
      name: 'SAP Ltd.',
      logo: 'SAPLogo.png',
    };
    const organization = await upsertOrganization(input, token);
    expect(organization.statusCode).to.be.equal(400);
    expect(organization.error).to.be.equal('Data does not match schema!');
  });
});
