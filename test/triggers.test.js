const { expect } = require('chai');
const { getToken } = require('./../lib/utils/snazzy');
const { configOptions } = require('./seed/seed');
const { getPersons } = require('../lib/triggers/getPersonsPolling');


describe('Test triggers', () => {
  let token;
  before(async () => {
    token = await getToken(configOptions);
  });
  it('should get all persons', async () => {
    getPersons(token);
    // const token = await getToken(configOptions);
    // expect(token).to.not.be.empty;
    // expect(token).to.be.a('string');
  });
});
