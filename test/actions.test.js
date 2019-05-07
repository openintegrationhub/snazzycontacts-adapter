const { expect } = require('chai');
const { getToken } = require('./../lib/utils/snazzy');
const { upsertPerson } = require('./../lib/actions/upsertPerson.js');
const { createPersonSuccessful, createPersonFailed } = require('./seed/actions.seed');
const { persons } = require('./seed/seed');

describe('Test actions', () => {
  let token;
  before(async () => {
    createPersonSuccessful;
    createPersonFailed;
    // createOrganizationSuccessful;
    // createOrganizationFailed;
  });

  it('should create a person', async () => {
    const person = await upsertPerson(persons[0], token);
    expect(person).to.not.be.empty;
    expect(person).to.be.a('object');
    expect(person.eventName).to.equal('PersonCreated');
    expect(person.meta.role).to.equal('USER');
    expect(person.meta.username).to.equal('admin@wice.de');
    expect(person.payload.firstName).to.equal('John');
    expect(person.payload.lastName).to.equal('Doe');
  });

  it('should throw an error if inout does not match schema', async () => {
    const input = {
      name: 'Jane',
      lastName: 'Simpson',
    };
    // const person = await upsertPerson(input, token);
    // console.log('PERSON: ', person);


    // expect(person).to.not.be.empty;
    // expect(person).to.be.a('object');
    // expect(person.eventName).to.equal('PersonCreated');
    // expect(person.meta.role).to.equal('USER');
    // expect(person.meta.username).to.equal('admin@wice.de');
    // expect(person.payload.firstName).to.equal('John');
    // expect(person.payload.lastName).to.equal('Doe');
  });
});
