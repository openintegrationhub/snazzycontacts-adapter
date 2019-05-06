const request = require('request-promise');

exports.process = async function (msg, cnf) {
  console.log(msg);

  const options = {
    url: cnf.url,
    json: true,
    body: msg.body,
  };

  const response = await request.post(options);
  console.log('RESPONSE: ', response);
};
