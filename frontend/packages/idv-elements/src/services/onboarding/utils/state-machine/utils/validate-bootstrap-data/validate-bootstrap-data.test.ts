import { IdDI } from '@onefootprint/types';

import validateBootstrapData from './validate-bootstrap-data';

describe('validateBootstrapData', () => {
  it('should filter out invalid entries', () => {
    // @ts-expect-error: null
    expect(validateBootstrapData(null, 'es-MX')).toEqual({});
    // @ts-expect-error: undefined
    expect(validateBootstrapData(undefined, 'es-MX')).toEqual({});
    expect(validateBootstrapData({}, 'es-MX')).toEqual({});

    expect(
      validateBootstrapData(
        {
          [IdDI.email]: 'invalid-email',
          [IdDI.phoneNumber]: 'invalid-phone',
          [IdDI.firstName]: '$#@#$',
          [IdDI.middleName]: 'reg#',
          [IdDI.lastName]: '',
          [IdDI.dob]: '1993-02-03',
          [IdDI.ssn9]: '123456',
          [IdDI.ssn4]: 'abc',
          [IdDI.addressLine1]: 'PO Box 232',
          [IdDI.addressLine2]: 'Apt 2',
          [IdDI.nationality]: {},
          [IdDI.city]: 'San Francisco',
          [IdDI.state]: 'CA',
          [IdDI.country]: 'mm',
          [IdDI.zip]: '12321',
          [IdDI.usLegalStatus]: 'invalid-status',
          [IdDI.citizenships]: ['mm', ''],
          [IdDI.visaKind]: 'invalid-visa-kind',
          [IdDI.visaExpirationDate]: '2020-01-01',
          unsupportedBootstrapKey: 'hello',
          null: null,
          undefined,
          123: 123,
        },
        'en-US',
      ),
    ).toEqual({
      [IdDI.addressLine2]: 'Apt 2',
      [IdDI.city]: 'San Francisco',
      [IdDI.state]: 'CA',
      [IdDI.zip]: '12321',
    });

    expect(
      validateBootstrapData(
        {
          [IdDI.email]: 'piip@onefootprint.com',
          [IdDI.phoneNumber]: '+15555550100',
          [IdDI.firstName]: 'Piip',
          [IdDI.middleName]: 'I',
          [IdDI.lastName]: 'Foot',
          [IdDI.dob]: '02/01/1992',
          [IdDI.ssn9]: '123451234',
          [IdDI.ssn4]: '1234',
          [IdDI.addressLine1]: '1234 Main St',
          [IdDI.addressLine2]: 'Apt 2',
          [IdDI.nationality]: 'US',
          [IdDI.city]: 'San Francisco',
          [IdDI.state]: 'CA',
          [IdDI.country]: 'US',
          [IdDI.zip]: '91212',
          [IdDI.usLegalStatus]: 'citizen',
          [IdDI.citizenships]: ['US'],
          [IdDI.visaKind]: 'f1',
          [IdDI.visaExpirationDate]: '01/01/2030',
        },
        'en-US',
      ),
    ).toEqual({
      [IdDI.email]: 'piip@onefootprint.com',
      [IdDI.phoneNumber]: '+15555550100',
      [IdDI.firstName]: 'Piip',
      [IdDI.middleName]: 'I',
      [IdDI.lastName]: 'Foot',
      [IdDI.dob]: '02/01/1992',
      [IdDI.ssn9]: '123451234',
      [IdDI.ssn4]: '1234',
      [IdDI.addressLine1]: '1234 Main St',
      [IdDI.addressLine2]: 'Apt 2',
      [IdDI.nationality]: 'US',
      [IdDI.city]: 'San Francisco',
      [IdDI.state]: 'CA',
      [IdDI.country]: 'US',
      [IdDI.zip]: '91212',
      [IdDI.usLegalStatus]: 'citizen',
      [IdDI.citizenships]: ['US'],
      [IdDI.visaKind]: 'f1',
      [IdDI.visaExpirationDate]: '01/01/2030',
    });

    expect(
      validateBootstrapData(
        {
          [IdDI.state]: 'internationalState',
          [IdDI.dob]: '25/12/1997',
          [IdDI.visaExpirationDate]: '2020-01-01',
        },
        'es-MX',
      ),
    ).toEqual({
      [IdDI.state]: 'internationalState',
      [IdDI.dob]: '25/12/1997',
    });

    expect(
      validateBootstrapData(
        {
          [IdDI.state]: 'customState',
          [IdDI.country]: 'US',
          [IdDI.dob]: '99/99/1232',
          [IdDI.visaExpirationDate]: '25/12/2030',
        },
        'en-US',
      ),
    ).toEqual({
      [IdDI.country]: 'US',
    });

    expect(
      validateBootstrapData(
        {
          [IdDI.country]: 'US',
          [IdDI.state]: 'MA',
          [IdDI.dob]: '05-12-1996',
          [IdDI.visaExpirationDate]: '25-12-2030',
        },
        'en-US',
      ),
    ).toEqual({
      [IdDI.country]: 'US',
      [IdDI.state]: 'MA',
    });
  });
});
