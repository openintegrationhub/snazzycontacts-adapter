/* eslint no-unused-expressions: "off" */

const { expect } = require('chai');
const { getEntries } = require('../lib/triggers/getPersonsPolling');
const {
  getPersonsSuccessful, getPersonsEmpty, getOrganizationsSuccessful, getOrganizationsEmpty,
} = require('./seed/triggers.seed');

describe('Triggers - getPersons & getOrganizations', () => {
  let token;
  before(async () => {
    getPersonsSuccessful;
    getPersonsEmpty;
    getOrganizationsSuccessful;
    getOrganizationsEmpty;
  });

  it('should get all persons', async () => {
    const snapshot = {
      lastUpdated: (new Date(0)).getTime(),
    };
    const persons = await getEntries(token, snapshot, null, 'person');
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

  it('should throw an exception if no persons were found', async () => {
    const snapshot = {
      lastUpdated: 0,
    };
    const persons = await getEntries(token, snapshot, null, 'person');
    expect(persons).to.equal('Expected records array.');
  });

  it('should get all organizations', async () => {
    const snapshot = {
      lastUpdated: (new Date(0)).getTime(),
    };
    const organizations = await getEntries(token, snapshot, null, 'organization');
    expect(organizations.result).to.not.be.empty;
    expect(organizations.result).to.be.a('array');
    expect(organizations.result).to.have.length(2);
    expect(organizations.result[1].name).to.equal('Company Ltd');
    expect(organizations.result[1].logo).to.equal('Logo');
    expect(organizations.result[1].uid).to.equal('3ghj7ajmg24hmh');
    expect(organizations.result[1].lastUpdate).to.equal('1553776079568');
    expect(organizations.result[1].addresses[0].street).to.equal('Main Str.');
    expect(organizations.result[1].addresses[0].streetNumber).to.equal('320');
    expect(organizations.result[1].addresses[0].city).to.equal('New York City');
    expect(organizations.result[1].contactData).to.be.a('array');
    expect(organizations.result[1].contactData).to.be.empty;
    expect(organizations.result[1].relations[0].partner.uid).to.equal('3gbdq1jtsry748');
    expect(organizations.result[1].relations[0].partner.kind).to.equal('Person');
    expect(organizations.result[1].relations[0].partner.name).to.equal('Jenk Ins');
    expect(organizations.result[1].relations[0].uids).to.be.a('array');
    expect(organizations.result[1].relations[0].uids[0]).to.equal('3gbdq1jtss29zz');
    expect(organizations.result[1].relations[0].uids[1]).to.equal('3gbdq1jtsry748');
    expect(organizations.result[1].relations[0].label).to.equal('Employee');
    expect(organizations.result[1].relations[0].type).to.equal('OrganizationToPerson');
  });

  it('should throw an exception if no organizations were found', async () => {
    const snapshot = {
      lastUpdated: 0,
    };
    const organizations = await getEntries(token, snapshot, null, 'organization');
    expect(organizations).to.equal('Expected records array.');
  });
});
