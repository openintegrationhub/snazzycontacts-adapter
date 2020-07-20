
const uuid = require('uuid');

function newMessage(body) {
  const msg = {
    id: uuid.v4(),
    attachments: {},
    body,
    headers: {},
    metadata: {},
  };

  return msg;
}


module.exports = {
  newMessage,
};
