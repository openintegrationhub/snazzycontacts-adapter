const { expect } = require('chai');
const { getToken } = require('./../lib/utils/snazzy');
const {
  upsertPerson, checkForExistingUser, resolveConflict, processAction,
} = require('./../lib/actions/upsertPerson.js');
const { upsertOrganization } = require('./../lib/actions/upsertOrganization.js');
const {
  createPersonSuccessful,
  createPersonFailed,
  createOrganizationSuccessful,
  createOrganizationFailed,
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
    getPerson;
    getPersonFailed;
    getPersonNoToken;
  });

  it('should resolve a conflict', async () => {
    const res = resolveConflict(persons[3], persons[4]);
  });

  it('should check for an existing person', async () => {
    const personExists = await checkForExistingUser(persons[0], token);
  });

  xit('should check .... 1', async () => {
    const personExists = await checkForExistingUser(persons[1], token);
  });

  xit('should check .... 2', async () => {
    const personExists = await checkForExistingUser(persons[2], undefined);
  });

  it('should create a person', async () => {
    // const personExists = await checkForExistingUser(persons[0], token);
    const person = await upsertPerson(persons[0], token);
    expect(person).to.not.be.empty;
    expect(person).to.be.a('object');
    expect(person.eventName).to.equal('PersonCreated');
    expect(person.meta.role).to.equal('USER');
    expect(person.meta.username).to.equal('admin@wice.de');
    expect(person.payload.firstName).to.equal('John');
    expect(person.payload.lastName).to.equal('Doe');
  });

  it('should throw an exception if input does not match models', async () => {
    const input = {
      body: {
        uid: '5h4k3j23211',
        firstName: 'Jane',
        lastName: 'Smith',
      },
    };
    const person = await upsertPerson(input, token);
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
