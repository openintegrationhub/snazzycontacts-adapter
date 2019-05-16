const { expect } = require('chai');
const { getToken } = require('./../lib/utils/snazzy');
const { getPersons } = require('../lib/triggers/getPersonsPolling');
const { getOrganizations } = require('../lib/triggers/getOrganizationsPolling');
// const { configOptions } = require('./seed/seed');
const {
  getPersonsSuccessful, getPersonsEmpty, getOrganizationsSuccessful, getOrganizationsEmpty,
} = require('./seed/triggers.seed');

describe('Triggers - getPersons & getOrganizations', () => {
  let token;
  before(async () => {
    // token = await getToken(configOptions);
    getPersonsSuccessful;
    getPersonsEmpty;
    getOrganizationsSuccessful;
    getOrganizationsEmpty;
  });

  it('should get all persons', async () => {
    const snapshot = {
      lastUpdated: (new Date(0)).getTime(),
    };
    const persons = await getPersons(token, snapshot);
    expect(persons.result).to.not.be.empty;
    expect(persons.result).to.be.a('array');
    expect(persons.result).to.have.length(2);
    expect(persons.result[0].firstName).to.equal('John');
    expect(persons.result[0].lastName).to.equal('Doe');
    expect(persons.result[0].photo).to.equal('www.photo.com/john');
    expect(persons.result[0].addresses[0].street).to.equal('Main Str');
    expect(persons.result[0].addresses[0].streetNumber).to.equal('688');
    expect(persons.result[0].addresses[0].city).to.equal('New York City');
    expect(persons.result[0].contactData[0].value).to.equal('johny@mail.com');
    expect(persons.result[0].contactData[2].type).to.equal('linkedIn');
  });

  // it('should throw an exception if no persons were found', async () => {
  //   const snapshot = {
  //     lastUpdated: 0,
  //   };
  //   const persons = await getPersons(token, snapshot);
  //   expect(persons).to.equal('Expected records array.');
  // });

  it('should get all organizations', async () => {
    const snapshot = {
      lastUpdated: (new Date(0)).getTime(),
    };
    const organizations = await getOrganizations(token, snapshot);
    expect(organizations).to.not.be.empty;
    expect(organizations).to.be.a('array');
    expect(organizations).to.have.length(2);
    expect(organizations[1].name).to.equal('Company Ltd');
    expect(organizations[1].logo).to.equal('Logo');
    expect(organizations[1].uid).to.equal('3ghj7ajmg24hmh');
    expect(organizations[1].lastUpdate).to.equal('1553776079568');
    expect(organizations[1].addresses[0].street).to.equal('Main Str.');
    expect(organizations[1].addresses[0].streetNumber).to.equal('320');
    expect(organizations[1].addresses[0].city).to.equal('New York City');
    expect(organizations[1].contactData).to.be.a('array');
    expect(organizations[1].contactData).to.be.empty;
    expect(organizations[1].relations[0].partner.uid).to.equal('3gbdq1jtsry748');
    expect(organizations[1].relations[0].partner.kind).to.equal('Person');
    expect(organizations[1].relations[0].partner.name).to.equal('Jenk Ins');
    expect(organizations[1].relations[0].uids).to.be.a('array');
    expect(organizations[1].relations[0].uids[0]).to.equal('3gbdq1jtss29zz');
    expect(organizations[1].relations[0].uids[1]).to.equal('3gbdq1jtsry748');
    expect(organizations[1].relations[0].label).to.equal('Employee');
    expect(organizations[1].relations[0].type).to.equal('OrganizationToPerson');
  });

  it('should throw an exception if no organizations were found', async () => {
    const snapshot = {
      lastUpdated: 0,
    };
    const organizations = await getOrganizations(token, snapshot);
    expect(organizations).to.equal('Expected records array.');
  });
});
