/* eslint no-unused-expressions: "off" */

const { expect } = require('chai');
const { getToken } = require('./../lib/utils/authentication');
const { configOptions } = require('./seed/seed');
const { loginSuccessful, loginFailed, loginFailedUser } = require('./seed/utils.seed');

describe('Authorization process', () => {
  before(async () => {
    loginSuccessful;
    loginFailed;
    loginFailedUser;
  });

  it('should get the token after successful authorization', async () => {
    const token = await getToken(configOptions);
    expect(token).to.equal('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
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
    expect(token.error.hasError).to.equal(true);
    expect(token.error.errorType).to.equal('Cannot log in');
    expect(token.statusCode).to.equal(401);
    expect(token.error).to.be.a('object');
  });
});
