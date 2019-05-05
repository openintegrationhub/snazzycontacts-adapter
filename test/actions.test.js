const { expect } = require('chai');
const { getToken } = require('./../lib/utils/snazzy');
const { upsertPerson } = require('./../lib/actions/upsertPerson.js');
const { createPersonSuccessful } = require('./seed/triggers.seed');
const { persons } = require('./seed/seed');

describe('Test actions', () => {
  let token;
  before(async () => {
    createPersonSuccessful;
    // createPersonFailed;
    // createOrganizationSuccessful;
    // createOrganizationFailed;
  });

  it.only('should create a person', async () => {
    const person = await upsertPerson(persons[0], token);
    expect(person).to.not.be.empty;
    expect(person).to.be.a('object');
    expect(person.eventName).to.equal('PersonCreated');
    expect(person.meta.role).to.equal('USER');
    expect(person.meta.username).to.equal('admin@wice.de');
    expect(person.payload.firstName).to.equal('John');
    expect(person.payload.lastName).to.equal('Doe');
  });
});
