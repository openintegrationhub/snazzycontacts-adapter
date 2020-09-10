/* eslint no-unused-expressions: "off" */

const { expect } = require('chai');
const nock = require('nock');
const { populateRelations } = require('./../lib/utils/helpers');

describe('Helpers', () => {
  nock('https://dev-api.snazzyapps.de/api/organization/reference')
    .get('')
    .query({
      appId: 'wice',
      recordUid: '12345',
    })
    .reply(404);

  nock('https://dev-api.snazzyapps.de/api/person/reference')
    .get('')
    .query({
      appId: 'wice',
      recordUid: '12345',
    })
    .reply(404);

  nock('https://dev-api.snazzyapps.de/api/organization/reference')
    .get('')
    .query({
      appId: 'wice',
      recordUid: '54321',
    })
    .reply(200, { uid: 'abcd' });


  it('should attempt to populate the relations of a given entry', async () => {
    const testPerson = {
      firstName: 'Test',
      lastName: 'Person',
      relations: [
        {
          label: 'EmptyRelation',
          uids: [
            '12345',
          ],
        },
        {
          label: 'TestRelation',
          uids: [
            '54321',
          ],
        },
      ],
    };

    const testCfg = {
      sourceApp: 'wice',
      devMode: true,
    };

    const newPerson = await populateRelations(testPerson, testCfg, 'TestToken');
    expect(newPerson.relations).to.have.lengthOf(1);
    expect(newPerson.relations[0].uids).to.have.lengthOf(1);
    expect(newPerson.relations[0].uids[0]).to.equal('abcd');
    expect(newPerson.relations[0].label).to.equal('TestRelation');
  });
});
