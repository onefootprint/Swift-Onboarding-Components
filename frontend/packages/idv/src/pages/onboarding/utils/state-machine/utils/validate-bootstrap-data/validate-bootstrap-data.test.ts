import { IdDI } from '@onefootprint/types';

import type { UserDatum } from '../../../../../../types';
import validateBootstrapData from './validate-bootstrap-data';

describe('validateBootstrapData', () => {
  it('should filter out invalid entries', () => {
    expect(validateBootstrapData({}, 'es-MX')).toEqual({});

    const d = <T>(value: T): UserDatum<T> => ({
      value,
      isBootstrap: true,
    });

    expect(
      validateBootstrapData(
        {
          [IdDI.email]: d('invalid-email'),
          [IdDI.phoneNumber]: d('invalid-phone'),
          [IdDI.firstName]: d('$#@#$'),
          [IdDI.middleName]: d('reg#'),
          [IdDI.lastName]: d(''),
          [IdDI.dob]: d('1993-02-03'),
          [IdDI.ssn9]: d('123456'),
          [IdDI.ssn4]: d('abc'),
          [IdDI.addressLine1]: d('PO Box 232'),
          [IdDI.addressLine2]: d('Apt 2'),
          [IdDI.nationality]: d(''),
          [IdDI.city]: d('San Francisco'),
          [IdDI.state]: d('CA'),
          [IdDI.country]: d('mm'),
          [IdDI.zip]: d('12321'),
          [IdDI.usLegalStatus]: d('invalid-status'),
          [IdDI.citizenships]: d(['mm', '']),
          [IdDI.visaKind]: d('invalid-visa-kind'),
          [IdDI.visaExpirationDate]: d('2020-01-01'),
          // @ts-ignore
          unsupportedBootstrapKey: d('hello'),
          null: null,
          undefined,
          123: 123,
        },
        'en-US',
      ),
    ).toEqual({
      [IdDI.addressLine2]: d('Apt 2'),
      [IdDI.city]: d('San Francisco'),
      [IdDI.state]: d('CA'),
      [IdDI.zip]: d('12321'),
    });

    expect(
      validateBootstrapData(
        {
          [IdDI.email]: d('piip@onefootprint.com'),
          [IdDI.phoneNumber]: d('+15555550100'),
          [IdDI.firstName]: d('Piip'),
          [IdDI.middleName]: d('I'),
          [IdDI.lastName]: d('Foot'),
          [IdDI.dob]: d('02/01/1992'),
          [IdDI.ssn9]: d('123451234'),
          [IdDI.ssn4]: d('1234'),
          [IdDI.addressLine1]: d('1234 Main St'),
          [IdDI.addressLine2]: d('Apt 2'),
          [IdDI.nationality]: d('US'),
          [IdDI.city]: d('San Francisco'),
          [IdDI.state]: d('CA'),
          [IdDI.country]: d('US'),
          [IdDI.zip]: d('91212'),
          [IdDI.usLegalStatus]: d('citizen'),
          [IdDI.citizenships]: d(['US']),
          [IdDI.visaKind]: d('f1'),
          [IdDI.visaExpirationDate]: d('01/01/2030'),
        },
        'en-US',
      ),
    ).toEqual({
      [IdDI.email]: d('piip@onefootprint.com'),
      [IdDI.phoneNumber]: d('+15555550100'),
      [IdDI.firstName]: d('Piip'),
      [IdDI.middleName]: d('I'),
      [IdDI.lastName]: d('Foot'),
      [IdDI.dob]: d('02/01/1992'),
      [IdDI.ssn9]: d('123451234'),
      [IdDI.ssn4]: d('1234'),
      [IdDI.addressLine1]: d('1234 Main St'),
      [IdDI.addressLine2]: d('Apt 2'),
      [IdDI.nationality]: d('US'),
      [IdDI.city]: d('San Francisco'),
      [IdDI.state]: d('CA'),
      [IdDI.country]: d('US'),
      [IdDI.zip]: d('91212'),
      [IdDI.usLegalStatus]: d('citizen'),
      [IdDI.citizenships]: d(['US']),
      [IdDI.visaKind]: d('f1'),
      [IdDI.visaExpirationDate]: d('01/01/2030'),
    });

    expect(
      validateBootstrapData(
        {
          [IdDI.state]: d('internationalState'),
          [IdDI.dob]: d('25/12/1997'),
          [IdDI.visaExpirationDate]: d('2020-01-01'),
        },
        'es-MX',
      ),
    ).toEqual({
      [IdDI.state]: d('internationalState'),
      [IdDI.dob]: d('25/12/1997'),
    });

    expect(
      validateBootstrapData(
        {
          [IdDI.state]: d('customState'),
          [IdDI.country]: d('US'),
          [IdDI.dob]: d('99/99/1232'),
          [IdDI.visaExpirationDate]: d('25/12/2030'),
        },
        'en-US',
      ),
    ).toEqual({
      [IdDI.country]: d('US'),
    });

    expect(
      validateBootstrapData(
        {
          [IdDI.country]: d('US'),
          [IdDI.state]: d('MA'),
          [IdDI.dob]: d('05-12-1996'),
          [IdDI.visaExpirationDate]: d('25-12-2030'),
          [IdDI.ssn9]: d('123-45-1234'),
        },
        'en-US',
      ),
    ).toEqual({
      [IdDI.country]: d('US'),
      [IdDI.state]: d('MA'),
      [IdDI.ssn9]: d('123-45-1234'),
    });
  });
});
