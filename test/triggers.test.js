const { expect } = require('chai');
const { getToken } = require('./../lib/utils/snazzy');
const { getPersons } = require('../lib/triggers/getPersonsPolling');
// const { configOptions } = require('./seed/seed');
const { getPersonsSuccessful, getPersonsEmpty } = require('./seed/triggers.seed');

describe('Test triggers', () => {
  let token;
  before(async () => {
    // token = await getToken(configOptions);
    getPersonsSuccessful;
    getPersonsEmpty;
  });

  it('should get all persons', async () => {
    const snapshot = {
      lastUpdated: (new Date(0)).toISOString(),
    };
    const persons = await getPersons(token, snapshot);
    expect(persons).to.not.be.empty;
    expect(persons).to.be.a('array');
    expect(persons).to.have.length(2);
    expect(persons[0].firstName).to.equal('John');
    expect(persons[0].lastName).to.equal('Doe');
    expect(persons[0].photo).to.equal('www.photo.com/john');
    expect(persons[0].addresses[0].street).to.equal('Main Str');
    expect(persons[0].addresses[0].streetNumber).to.equal('688');
    expect(persons[0].addresses[0].city).to.equal('Ney York City');
    expect(persons[0].contactData[0].value).to.equal('johny@mail.com');
    expect(persons[0].contactData[2].type).to.equal('linkedIn');
  });

  it('should throw an exception that no records were found', async () => {
    const snapshot = {
      lastUpdated: 0,
    };
    const persons = await getPersons(token, snapshot);
    expect(persons).to.equal('Expected records array.');
  });
});
