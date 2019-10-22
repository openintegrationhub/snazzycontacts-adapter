/* eslint no-unused-expressions: "off" */

const { expect } = require('chai');
const { upsertObject } = require('../lib/utils/helpers');
const { deletePerson } = require('../lib/actions/deletePerson');
const { deleteOrganization } = require('../lib/actions/deleteOrganization');

const {
  resolve,
  checkForExistingObject,
  resolveConflict,
} = require('./../lib/utils/resolver.js');

const {
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
} = require('./seed/actions.seed');
const { persons, organizations } = require('./seed/seed');

describe('Actions - upsertPerson & upsertOrganization', () => {
  const token = 'WXYUFOmgDdoniZatfaMTa4Ov-An98v2-4668x5fXOoLZS';
  before(async () => {
    createPersonSuccessful;
    createPersonFailed;
    deletePersonSuccessful;
    deletePersonFailed;
    deletePersonNotFound;
    createOrganizationSuccessful;
    createOrganizationFailed;
    deleteOrganizationSuccessful;
    deleteOrganizationFailed;
    deleteOrganizationNotFound;
    updatePerson;
    getPerson;
    getPersonFailed;
    getPersonNoToken;
  });

  it('should resolve a conflict via CFM module', async () => {
    const res = await resolve(persons[5], token, 'person');
    expect(res.resolvedConflict.firstName).to.equal('Jane');
    expect(res.resolvedConflict.lastName).to.equal('Brown');
    expect(res.resolvedConflict.uid).to.equal('902jf1jxq2ss3x');
    expect(res.resolvedConflict.gender).to.equal('female');
    expect(res.resolvedConflict.addresses[0].city).to.equal('Cologne');
    expect(res.resolvedConflict.categories[0].label).to.equal('Customer');
  });

  it('should resolve a conflict', async () => {
    const res = resolveConflict(persons[3], persons[6]);
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
    const res = await checkForExistingObject(persons[0], token, 'person');
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
    const res = await checkForExistingObject(persons[1], token, 'person');
    expect(res).to.be.false;
  });

  it('should return false if token is undefined', async () => {
    const res = await checkForExistingObject(persons[2], undefined, 'person');
    expect(res).to.be.false;
  });

  it('should create a person', async () => {
    const person = await upsertObject(persons[0], token, false, 'person');
    expect(person).to.not.be.empty;
    expect(person).to.be.a('object');
    expect(person.statusCode).to.be.equal(200);
    expect(person.body.eventName).to.equal('PersonCreated');
    expect(person.body.meta.role).to.equal('USER');
    expect(person.body.meta.username).to.equal('admin@wice.de');
    expect(person.body.payload.firstName).to.equal('John');
    expect(person.body.payload.lastName).to.equal('Doe');
  });

  it('should not create a person if type is undefined', async () => {
    const person = await upsertObject(persons[0], token, false);
    expect(person).to.be.false;
  });

  it('should update a person', async () => {
    const person = await upsertObject(persons[4], token, true, 'person', persons[4].body.meta);
    expect(person).to.not.be.empty;
    expect(person).to.be.a('object');
    expect(person.statusCode).to.be.equal(200);
    expect(person.body.eventName).to.equal('PersonLastNameUpdated');
    expect(person.body.meta.role).to.equal('USER');
    expect(person.body.meta.username).to.equal('admin@wice.de');
    expect(person.body.payload.uid).to.equal('25mop1jzwjc4by');
    expect(person.body.payload.lastName).to.equal('Stevenson');
  });

  it('should throw an exception if input does not match models', async () => {
    const input = {
      body: {
        meta: {
          uid: '5h4k3j23211',
        },
        data: {
          uid: '5h4k3j23211',
          firstName: 'Jane',
          lastName: 'Smith',
        },
      },
    };
    const person = await upsertObject(input, token, false, 'person');
    expect(person.statusCode).to.be.equal(400);
    expect(person.body).to.be.equal('Data does not match schema!');
  });

  it('should create an organization', async () => {
    const organization = await upsertObject(organizations[0], token, false, 'organization');
    expect(organization).to.not.be.empty;
    expect(organization.statusCode).to.be.equal(200);
    expect(organization).to.be.a('object');
    expect(organization.body.eventName).to.equal('OrganizationCreated');
    expect(organization.body.meta.role).to.equal('USER');
    expect(organization.body.meta.username).to.equal('admin@wice.de');
    expect(organization.body.payload.name).to.equal('Wice GmbH');
    expect(organization.body.payload.logo).to.equal('Logo');
  });

  it('should return 400 and throw an exception if input does not match models', async () => {
    const input = {
      body: {
        meta: {
          uid: 'dj277ajhd628',
        },
        data: {
          name: 'SAP Ltd.',
          logo: 'SAPLogo.png',
        },
      },
    };
    const organization = await upsertObject(input, token, false, 'organization');
    expect(organization.statusCode).to.be.equal(400);
    expect(organization.body).to.be.equal('Data does not match schema!');
  });

  it('should return 200 and delete a person', async () => {
    const input = {
      body: {
        uid: '8sjwp1jvdhswq2',
      },
    };
    const person = await deletePerson(input, token);
    expect(person.body).to.be.a('object');
    expect(person.body.eventName).to.be.equal('PersonDeleted');
    expect(person.body.payload.uid).to.be.equal('8sjwp1jvdhswq2');
    expect(person.statusCode).to.be.equal(200);
  });

  it('should return 400 if no person uid is specified', async () => {
    const input = {
      body: {
        uid: null,
      },
    };
    const res = await deletePerson(input, token);
    expect(res).to.equal('Uid is not defined!');
  });

  it('should return 204 if person not found', async () => {
    const input = {
      body: {
        uid: 111111,
      },
    };
    const res = await deletePerson(input, token);
    expect(res.statusCode).to.be.equal(204);
  });

  it('should return 200 and delete an organization', async () => {
    const input = {
      body: {
        uid: '2jkwerjvdhswq2',
      },
    };
    const organization = await deleteOrganization(input, token);
    expect(organization.body).to.be.a('object');
    expect(organization.body.eventName).to.be.equal('OrganizationDeleted');
    expect(organization.body.payload.uid).to.be.equal('2jkwerjvdhswq2');
    expect(organization.statusCode).to.be.equal(200);
  });

  it('should return 400 if no organization uid is specified', async () => {
    const input = {
      body: {
        uid: null,
      },
    };

    const res = await deleteOrganization(input, token);
    expect(res).to.equal('Uid is not defined!');
  });

  it('should return 204 if organization not found', async () => {
    const input = {
      body: {
        uid: 222222,
      },
    };
    const res = await deleteOrganization(input, token);
    expect(res.statusCode).to.be.equal(204);
  });
});
