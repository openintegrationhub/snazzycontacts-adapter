const nock = require('nock');

const loginSuccessful = nock('https://api.snazzycontacts.com/api/iam/login')
  .post('')
  .reply(200, {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1YmM1ZDcwY2U2NzNkNjAwMTA3MGJhOWYiLCJ1c2VybmFtZSI6ImFkbWluQGV4YW1wbGUuY29tIiwicm9sZSI6IkFETUlOIiwibWVtYmVyc2hpcHMiOlt7InJvbGUiOiJURU5BTlRfR1VFU1QiLCJfaWQiOiIxMjM0NSJ9XSwiaWF0IjoxNTU1OTE3Mzc0LCJleHAiOjE1NTU5MjgxNzQsImF1ZCI6ImV4YW1wbGUuY29tIiwiaXNzIjoiaHR0cHM6Ly8xMjcuMC4wLjE6MzA5OSJ9.u1jgiQuDwd33PkjNyn-0MDLA2V627DbzAQQmFaRHR9s',
    user: '5bc5d70ce673d6001070ba9f',
    username: 'admin@example.com',
    tenant: '284k49836292470011e20458',
    tenantRole: 'TENANT_GUEST',
    role: 'ADMIN',
  });

const loginFailed = nock('https://api.snazzycontacts.com/api/iam/login')
  .post('')
  .reply(400, { error: 'Please enter a valid username and password' });

const loginFailedUser = nock('https://api.snazzycontacts.com/api/iam/login')
  .post('')
  .reply(401, { message: 'USER_NOT_FOUND', hasError: true, errorType: 'Cannot log in' });

module.exports = {
  loginSuccessful,
  loginFailed,
  loginFailedUser,
};
