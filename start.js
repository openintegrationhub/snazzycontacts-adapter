console.log('IN START SCRIPT');
const { process } = require('./lib/triggers/getPersonsPolling.js');

const msg = {};
const cfg = {
  username: 'syanev@wice.de',
  password: 'Qwerty1234',
};

process(msg, cfg);
