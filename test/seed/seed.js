const options = {
  json: {
    max_hits: 100,
  },
  headers: {
    'X-API-KEY': 'acilfogux3h4xv5cilhiqskr8xo6ghhh',
  },
};

const configOptions = {
  email: 'admin@example.com',
  password: 'somestring',
};

const organizations = [{
  body: {
    name: 'Company Ltd.',
    email: 'info@company.com',
  },
},
{
  body: {
    name: 'Test GmbH',
    email: 'info@testgmbh.com',
  },
},
{
  body: {
    name: 'Travel Mates',
    email: 'info@travelmates.com',
  },
},
];

const persons = [{
  body: {
    name: 'Brown',
    firstname: 'Adam',
  },
},
{
  body: {
    name: 'Doe',
    firstname: 'John',
  },
},
{
  body: {
    name: 'Kolarov',
    firstname: 'Sebastian',
    email: 'kolarov@mail.com',
  },
},
];

module.exports = {
  options,
  configOptions,
  persons,
  organizations,
};
