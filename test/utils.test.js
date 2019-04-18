const { expect } = require('chai');
const { getToken } = require('./../lib/utils/snazzy');
const { configOptions } = require('./seed/seed');

describe('Test utils', () => {
  it('should get the token after successful authorization', async () => {
    const token = await getToken(configOptions);
    expect(token).to.not.be.empty;
    expect(token).to.be.a('string');
  });

  it('should return 400 if no credentials are given', async () => {
    const token = await getToken({});
    expect(token).to.not.be.empty;
    expect(token.error.error).to.equal('Please enter a valid username and password');
    expect(token.statusCode).to.equal(400);
    expect(token.error).to.be.a('object');
  });

  it('should return 401 if user does not exist', async () => {
    const credentials = {
      email: 'doesnotexist@mail.com',
      password: '!PassW@rD',
    };
    const token = await getToken(credentials);
    expect(token).to.not.be.empty;
    expect(token.error.message).to.equal('USER_NOT_FOUND');
    expect(token.statusCode).to.equal(401);
    expect(token.error).to.be.a('object');
  });
});
