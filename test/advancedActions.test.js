/* eslint no-unused-expressions: "off" */

const { expect } = require('chai');
const { upsertObjectAdvanced } = require('../lib/utils/helpers');
// const { deletePerson } = require('../lib/actions/deletePerson');
// const { deleteOrganization } = require('../lib/actions/deleteOrganization');

const {
  createPersonSuccessful,
  createPersonFailed,
  // deletePersonSuccessful,
  // deletePersonFailed,
  // deletePersonNotFound,
  createOrganizationSuccessful,
  createOrganizationFailed,
  // deleteOrganizationSuccessful,
  // deleteOrganizationFailed,
  // deleteOrganizationNotFound,
  updatePerson,
  getPerson,
  getPersonFailed,
  getPersonNoToken,
} = require('./seed/actionsAdvanced.seed');
const { persons, organizations } = require('./seed/seed');

describe('Actions - upsertPerson & upsertOrganization', () => {
  const token = 'WXYUFOmgDdoniZatfaMTa4Ov-An98v2-4668x5fXOoLZS';
  before(async () => {
    createPersonSuccessful;
    createPersonFailed;
    // deletePersonSuccessful;
    // deletePersonFailed;
    // deletePersonNotFound;
    createOrganizationSuccessful;
    createOrganizationFailed;
    // deleteOrganizationSuccessful;
    // deleteOrganizationFailed;
    // deleteOrganizationNotFound;
    updatePerson;
    getPerson;
    getPersonFailed;
    getPersonNoToken;
  });

  it('should create a person via upsertAdvanced', async () => {
    const person = await upsertObjectAdvanced(persons[0], token, false, 'person');
    expect(person).to.not.be.empty;
    expect(person).to.be.a('object');
    expect(person.statusCode).to.be.equal(200);
    expect(person.body[0].eventName).to.equal('PersonCreated');
    expect(person.body[0].meta.role).to.equal('USER');
    expect(person.body[0].meta.username).to.equal('admin@wice.de');
    expect(person.body[0].payload.firstName).to.equal('John');
    expect(person.body[0].payload.lastName).to.equal('Doe');
  });

  it('should not create a person if type is undefined via upsertAdvanced', async () => {
    const person = await upsertObjectAdvanced(persons[0], token, false);
    expect(person).to.be.false;
  });

  it('should update a person via upsertAdvanced', async () => {
    const person = await upsertObjectAdvanced(persons[4], token, true, 'person', persons[4].metadata.recordUid, 'someApp', 'someUser');
    expect(person).to.not.be.empty;
    expect(person).to.be.a('object');
    expect(person.statusCode).to.be.equal(200);
    expect(person.body[0].eventName).to.equal('PersonLastNameUpdated');
    expect(person.body[0].meta.role).to.equal('USER');
    expect(person.body[0].meta.username).to.equal('admin@wice.de');
    expect(person.body[0].payload.uid).to.equal('25mop1jzwjc4by');
    expect(person.body[0].payload.lastName).to.equal('Stevenson');
  });

  it('should throw an exception if input does not match models via upsertAdvanced', async () => {
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
    const person = await upsertObjectAdvanced(input, token, false, 'person');
    expect(person.statusCode).to.be.equal(400);
    expect(person.body).to.be.equal('Data does not match schema!');
  });

  it('should create an organization via upsertAdvanced', async () => {
    const organization = await upsertObjectAdvanced(organizations[0], token, false, 'organization');
    expect(organization).to.not.be.empty;
    expect(organization.statusCode).to.be.equal(200);
    expect(organization).to.be.a('object');
    expect(organization.body.eventName).to.equal('OrganizationCreated');
    expect(organization.body.meta.role).to.equal('USER');
    expect(organization.body.meta.username).to.equal('admin@wice.de');
    expect(organization.body.payload.name).to.equal('Wice GmbH');
    expect(organization.body.payload.logo).to.equal('Logo');
  });

  it('should return 400 and throw an exception if input does not match models via upsertAdvanced', async () => {
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
    const organization = await upsertObjectAdvanced(input, token, false, 'organization');
    expect(organization.statusCode).to.be.equal(400);
    expect(organization.body).to.be.equal('Data does not match schema!');
  });

  // it('should return 200 and delete a person', async () => {
  //   const input = {
  //     body: {
  //       uid: '8sjwp1jvdhswq2',
  //     },
  //   };
  //   const person = await deletePerson(input, token);
  //   expect(person.body).to.be.a('object');
  //   expect(person.body.eventName).to.be.equal('PersonDeleted');
  //   expect(person.body.payload.uid).to.be.equal('8sjwp1jvdhswq2');
  //   expect(person.statusCode).to.be.equal(200);
  // });

  // it('should return 400 if no person uid is specified', async () => {
  //   const input = {
  //     body: {
  //       uid: null,
  //     },
  //   };
  //   const res = await deletePerson(input, token);
  //   expect(res).to.equal('Uid is not defined!');
  // });

  // it('should return 204 if person not found', async () => {
  //   const input = {
  //     body: {
  //       uid: 111111,
  //     },
  //   };
  //   const res = await deletePerson(input, token);
  //   expect(res.statusCode).to.be.equal(204);
  // });

  // it('should return 200 and delete an organization', async () => {
  //   const input = {
  //     body: {
  //       uid: '2jkwerjvdhswq2',
  //     },
  //   };
  //   const organization = await deleteOrganization(input, token);
  //   expect(organization.body).to.be.a('object');
  //   expect(organization.body.eventName).to.be.equal('OrganizationDeleted');
  //   expect(organization.body.payload.uid).to.be.equal('2jkwerjvdhswq2');
  //   expect(organization.statusCode).to.be.equal(200);
  // });

  // it('should return 400 if no organization uid is specified', async () => {
  //   const input = {
  //     body: {
  //       uid: null,
  //     },
  //   };
  //
  //   const res = await deleteOrganization(input, token);
  //   expect(res).to.equal('Uid is not defined!');
  // });

  // it('should return 204 if organization not found', async () => {
  //   const input = {
  //     body: {
  //       uid: 222222,
  //     },
  //   };
  //   const res = await deleteOrganization(input, token);
  //   expect(res.statusCode).to.be.equal(204);
  // });
});
