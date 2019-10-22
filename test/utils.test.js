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
    expect(token).to.equal('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1YmM1ZDcwY2U2NzNkNjAwMTA3MGJhOWYiLCJ1c2VybmFtZSI6ImFkbWluQGV4YW1wbGUuY29tIiwicm9sZSI6IkFETUlOIiwibWVtYmVyc2hpcHMiOlt7InJvbGUiOiJURU5BTlRfR1VFU1QiLCJfaWQiOiIxMjM0NSJ9XSwiaWF0IjoxNTU1OTE3Mzc0LCJleHAiOjE1NTU5MjgxNzQsImF1ZCI6ImV4YW1wbGUuY29tIiwiaXNzIjoiaHR0cHM6Ly8xMjcuMC4wLjE6MzA5OSJ9.u1jgiQuDwd33PkjNyn-0MDLA2V627DbzAQQmFaRHR9s');
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
