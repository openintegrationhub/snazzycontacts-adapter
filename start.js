const {process} = require('./lib/triggers/getPersonsPolling.js');

const msg = {};
const cfg = {
  username: 'syanev@wice.de',
  password: 'd36adb53'
};

console.log('IN START SCRIPT');

process(msg, cfg);
