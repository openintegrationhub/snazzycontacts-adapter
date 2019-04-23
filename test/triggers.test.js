const { expect } = require('chai');
const { getToken } = require('./../lib/utils/snazzy');
const { getPersons } = require('../lib/triggers/getPersonsPolling');
// const { configOptions } = require('./seed/seed');
const { getPersonsSuccessful } = require('./seed/triggers.seed');

describe('Test triggers', () => {
  let token;
  before(async () => {
    // token = await getToken(configOptions);
    getPersonsSuccessful;
  });

  it('should get all persons', async () => {
    const snapshot = {
      lastUpdated: 0,
    };
    const persons = await getPersons(token, snapshot);
    expect(persons.data).to.not.be.empty;
    expect(persons.data).to.be.a('array');
    expect(persons.data).to.have.length(2);
    expect(persons.data[0].firstName).to.equal('John');
    expect(persons.data[0].lastName).to.equal('Doe');
    expect(persons.data[0].photo).to.equal('www.photo.com/john');
    expect(persons.data[0].addresses[0].street).to.equal('Main Str');
    expect(persons.data[0].addresses[0].streetNumber).to.equal('688');
    expect(persons.data[0].addresses[0].city).to.equal('Ney York City');
    expect(persons.data[0].contactData[0].value).to.equal('johny@mail.com');
    expect(persons.data[0].contactData[2].type).to.equal('linkedIn');
  });
});
