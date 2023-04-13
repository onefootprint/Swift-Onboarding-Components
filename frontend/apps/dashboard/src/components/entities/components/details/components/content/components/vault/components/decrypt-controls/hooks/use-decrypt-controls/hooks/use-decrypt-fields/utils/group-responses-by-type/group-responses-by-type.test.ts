import { BusinessDI, IdDI } from '@onefootprint/types';

import groupResponsesByType from './group-responses-by-type';

describe('groupResponsesByType', () => {
  it('should group text responses', () => {
    expect(
      groupResponsesByType([
        {
          [BusinessDI.state]: 'CT',
          [BusinessDI.city]: 'West Haven',
          [BusinessDI.zip]: '06516',
          [BusinessDI.tin]: '124412142',
          [BusinessDI.beneficialOwners]:
            '[{"first_name":"Jane","last_name":"Doe","ownership_stake":25}]',
          [BusinessDI.name]: 'Acme Bank',
          [BusinessDI.addressLine1]: '14 Linda Street',
          [BusinessDI.country]: 'US',
        },
      ]),
    ).toEqual({
      text: {
        [BusinessDI.state]: 'CT',
        [BusinessDI.city]: 'West Haven',
        [BusinessDI.zip]: '06516',
        [BusinessDI.tin]: '124412142',
        [BusinessDI.beneficialOwners]:
          '[{"first_name":"Jane","last_name":"Doe","ownership_stake":25}]',
        [BusinessDI.name]: 'Acme Bank',
        [BusinessDI.addressLine1]: '14 Linda Street',
        [BusinessDI.country]: 'US',
      },
    });

    expect(
      groupResponsesByType([
        {
          [IdDI.phoneNumber]: '+17077190993',
          [IdDI.email]: 'jane@acme.com',
          [IdDI.firstName]: 'Jane',
          [IdDI.lastName]: 'Doe',
        },
      ]),
    ).toEqual({
      text: {
        [IdDI.phoneNumber]: '+17077190993',
        [IdDI.email]: 'jane@acme.com',
        [IdDI.firstName]: 'Jane',
        [IdDI.lastName]: 'Doe',
      },
    });
  });
});
