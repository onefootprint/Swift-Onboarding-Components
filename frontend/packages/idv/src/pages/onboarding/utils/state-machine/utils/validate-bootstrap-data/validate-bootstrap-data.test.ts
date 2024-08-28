import { IdDI, OnboardingConfigStatus, type PublicOnboardingConfig } from '@onefootprint/types';

import type { DIMetadata } from '../../../../../../types';
import validateBootstrapData, { isBusinessOwnersValid, isDobValid } from './validate-bootstrap-data';

const config: PublicOnboardingConfig = {
  isLive: true,
  logoUrl: 'url',
  privacyPolicyUrl: 'url',
  name: 'tenant',
  orgName: 'tenantOrg',
  orgId: 'orgId',
  status: OnboardingConfigStatus.enabled,
  isAppClipEnabled: false,
  isInstantAppEnabled: false,
  appClipExperienceId: 'app_exp_9KlTyouGLSNKMgJmpUdBAF',
  isNoPhoneFlow: false,
  requiresIdDoc: false,
  key: 'key',
  isKyb: false,
  allowInternationalResidents: true,
  supportedCountries: ['US', 'CA'],
};

describe('validateBootstrapData', () => {
  const createDIMetadata = <T>(value: T): DIMetadata<T> => ({
    value,
    isBootstrap: true,
  });

  it('should filter out invalid entries', () => {
    expect(validateBootstrapData({ bootstrapData: {}, config, locale: 'es-MX' })).toEqual({});

    expect(
      validateBootstrapData({
        bootstrapData: {
          [IdDI.email]: createDIMetadata('invalid-email'),
          [IdDI.phoneNumber]: createDIMetadata('invalid-phone'),
          [IdDI.firstName]: createDIMetadata('$#@#$'),
          [IdDI.middleName]: createDIMetadata('reg#'),
          [IdDI.lastName]: createDIMetadata(''),
          [IdDI.dob]: createDIMetadata('1993-02-03'),
          [IdDI.ssn9]: createDIMetadata('123456'),
          [IdDI.ssn4]: createDIMetadata('abc'),
          [IdDI.addressLine1]: createDIMetadata('PO Box 232'),
          [IdDI.addressLine2]: createDIMetadata('Apt 2'),
          [IdDI.nationality]: createDIMetadata(''),
          [IdDI.city]: createDIMetadata('San Francisco'),
          [IdDI.state]: createDIMetadata('CA'),
          [IdDI.country]: createDIMetadata('mm'),
          [IdDI.zip]: createDIMetadata('12321'),
          [IdDI.usLegalStatus]: createDIMetadata('invalid-status'),
          [IdDI.citizenships]: createDIMetadata(['mm', '']),
          [IdDI.visaKind]: createDIMetadata('invalid-visa-kind'),
          [IdDI.visaExpirationDate]: createDIMetadata('2020-01-01'),
          // @ts-ignore
          unsupportedBootstrapKey: createDIMetadata('hello'),
          null: null,
          undefined,
          123: 123,
        },
        config,
        locale: 'en-US',
      }),
    ).toEqual({
      [IdDI.addressLine2]: createDIMetadata('Apt 2'),
      [IdDI.city]: createDIMetadata('San Francisco'),
      [IdDI.dob]: createDIMetadata('02/03/1993'),
      [IdDI.state]: createDIMetadata('CA'),
      [IdDI.visaExpirationDate]: createDIMetadata('01/01/2020'),
      [IdDI.zip]: createDIMetadata('12321'),
    });

    expect(
      validateBootstrapData({
        bootstrapData: {
          [IdDI.email]: createDIMetadata('piip@onefootprint.com'),
          [IdDI.phoneNumber]: createDIMetadata('+15555550100'),
          [IdDI.firstName]: createDIMetadata('Piip'),
          [IdDI.middleName]: createDIMetadata('I'),
          [IdDI.lastName]: createDIMetadata('Foot'),
          [IdDI.dob]: createDIMetadata('02/01/1992'),
          [IdDI.ssn9]: createDIMetadata('123451234'),
          [IdDI.ssn4]: createDIMetadata('1234'),
          [IdDI.addressLine1]: createDIMetadata('1234 Main St'),
          [IdDI.addressLine2]: createDIMetadata('Apt 2'),
          [IdDI.nationality]: createDIMetadata('US'),
          [IdDI.city]: createDIMetadata('San Francisco'),
          [IdDI.state]: createDIMetadata('CA'),
          [IdDI.country]: createDIMetadata('US'),
          [IdDI.zip]: createDIMetadata('91212'),
          [IdDI.usLegalStatus]: createDIMetadata('citizen'),
          [IdDI.citizenships]: createDIMetadata(['US']),
          [IdDI.visaKind]: createDIMetadata('f1'),
          [IdDI.visaExpirationDate]: createDIMetadata('01/01/2030'),
        },
        config,
        locale: 'en-US',
      }),
    ).toEqual({
      [IdDI.email]: createDIMetadata('piip@onefootprint.com'),
      [IdDI.phoneNumber]: createDIMetadata('+15555550100'),
      [IdDI.firstName]: createDIMetadata('Piip'),
      [IdDI.middleName]: createDIMetadata('I'),
      [IdDI.lastName]: createDIMetadata('Foot'),
      [IdDI.dob]: createDIMetadata('02/01/1992'),
      [IdDI.ssn9]: createDIMetadata('123451234'),
      [IdDI.ssn4]: createDIMetadata('1234'),
      [IdDI.addressLine1]: createDIMetadata('1234 Main St'),
      [IdDI.addressLine2]: createDIMetadata('Apt 2'),
      [IdDI.nationality]: createDIMetadata('US'),
      [IdDI.city]: createDIMetadata('San Francisco'),
      [IdDI.state]: createDIMetadata('CA'),
      [IdDI.country]: createDIMetadata('US'),
      [IdDI.zip]: createDIMetadata('91212'),
      [IdDI.usLegalStatus]: createDIMetadata('citizen'),
      [IdDI.citizenships]: createDIMetadata(['US']),
      [IdDI.visaKind]: createDIMetadata('f1'),
      [IdDI.visaExpirationDate]: createDIMetadata('01/01/2030'),
    });

    expect(
      validateBootstrapData({
        bootstrapData: {
          [IdDI.state]: createDIMetadata('internationalState'),
          [IdDI.dob]: createDIMetadata('25/12/1997'),
          [IdDI.visaExpirationDate]: createDIMetadata('2020-01-01'),
        },
        config,
        locale: 'es-MX',
      }),
    ).toEqual({
      [IdDI.state]: createDIMetadata('internationalState'),
      [IdDI.dob]: createDIMetadata('25/12/1997'),
      [IdDI.visaExpirationDate]: createDIMetadata('01/01/2020'),
    });

    expect(
      validateBootstrapData({
        bootstrapData: {
          [IdDI.state]: createDIMetadata('customState'),
          [IdDI.country]: createDIMetadata('US'),
          [IdDI.dob]: createDIMetadata('99/99/1232'),
          [IdDI.visaExpirationDate]: createDIMetadata('25/12/2030'),
        },
        config,
        locale: 'en-US',
      }),
    ).toEqual({
      [IdDI.country]: createDIMetadata('US'),
    });

    expect(
      validateBootstrapData({
        bootstrapData: {
          [IdDI.country]: createDIMetadata('US'),
          [IdDI.state]: createDIMetadata('MA'),
          [IdDI.dob]: createDIMetadata('05-12-1996'),
          [IdDI.visaExpirationDate]: createDIMetadata('25-12-2030'),
          [IdDI.ssn9]: createDIMetadata('123-45-1234'),
        },
        config,
        locale: 'en-US',
      }),
    ).toEqual({
      [IdDI.country]: createDIMetadata('US'),
      [IdDI.state]: createDIMetadata('MA'),
      [IdDI.ssn9]: createDIMetadata('123-45-1234'),
    });

    expect(
      validateBootstrapData({
        bootstrapData: {
          [IdDI.country]: createDIMetadata('MX'),
          [IdDI.state]: createDIMetadata('MA'),
          [IdDI.dob]: createDIMetadata('05-12-1996'),
          [IdDI.visaExpirationDate]: createDIMetadata('25-12-2030'),
          [IdDI.ssn9]: createDIMetadata('123-45-1234'),
        },
        config,
        locale: 'en-US',
      }),
    ).toEqual({
      [IdDI.state]: createDIMetadata('MA'),
      [IdDI.ssn9]: createDIMetadata('123-45-1234'),
    });
  });
});

describe('isBusinessOwnersValid', () => {
  it('should return false for empty owners array', () => {
    expect(isBusinessOwnersValid([])).toBe(false);
  });

  it('should return false for empty owners', () => {
    expect(isBusinessOwnersValid([{}])).toBe(false);
  });

  it('should return false for non-array owners', () => {
    // @ts-expect-error: passing wrong type
    expect(isBusinessOwnersValid('not an array')).toBe(false);
  });

  it('should return false for owners array with non-object elements', () => {
    // @ts-expect-error: passing wrong type
    expect(isBusinessOwnersValid([1, 2, 3])).toBe(false);
  });

  it('should return false for owners array with missing required fields', () => {
    expect(isBusinessOwnersValid([{ first_name: 'John' }])).toBe(true);
  });

  it('should return false for owners array with invalid field values', () => {
    // @ts-expect-error: passing number on first_name
    expect(isBusinessOwnersValid([{ first_name: 123, last_name: 'Doe', email: 'invalid email' }])).toBe(false);
  });

  it('should return true for owners array with valid field values', () => {
    expect(isBusinessOwnersValid([{ first_name: 'John', last_name: 'Doe', email: 'john.doe@example.com' }])).toBe(true);
  });

  it('should convert the property names to snake_case and validate it', () => {
    // @ts-expect-error: properties in camelCase
    expect(isBusinessOwnersValid([{ firstName: 'John', lastName: 'Doe' }])).toBe(true);
  });

  it('should validate the entire list', () => {
    expect(
      isBusinessOwnersValid([
        {
          // @ts-expect-error: properties in camelCase
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          ownershipStake: 0,
          phoneNumber: '+4915206073699',
        },
        {
          // @ts-expect-error: properties in camelCase
          firstName: 'a',
          lastName: 'c',
          email: 'a@b.com',
          ownershipStake: 100,
          phoneNumber: '+4915206073999',
        },
      ]),
    ).toBe(true);
  });
});

describe('isDobValid', () => {
  const today = new Date();
  const twentyFourHoursFromNow = new Date(Date.now() + 1000 * 60 * 60 * 24);
  const twentyFourHoursFromNowIso = twentyFourHoursFromNow.toISOString().split('T')[0];

  const seventeenYearsAgo = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate());
  const seventeenYearsAgoIso = seventeenYearsAgo.toISOString().split('T')[0];

  describe('en-US', () => {
    it('should return true for a valid date when YYYY-MM-DD format is provided', () => {
      expect(isDobValid('en-US', '2000-04-12')).toBe(true);
    });
    it('should return true for a valid date when en-US + MM/DD/YYYY format is provided', () => {
      expect(isDobValid('en-US', '12/25/2000')).toBe(true);
    });

    it('should return false for a date in the future', () => {
      expect(isDobValid('en-US', twentyFourHoursFromNowIso)).toBe(false);
    });

    it('should return false for a date before 1900', () => {
      expect(isDobValid('en-US', '1899-12-31')).toBe(false);
    });

    it('should return false for a date that is too young < 18 years', () => {
      expect(isDobValid('en-US', seventeenYearsAgoIso)).toBe(false);
    });
  });

  describe('es-MX', () => {
    it('should return true for a valid date when YYYY-MM-DD format is provided', () => {
      expect(isDobValid('es-MX', '2000-04-12')).toBe(true);
    });
    it('should return true for a valid date when en-US + MM/DD/YYYY format is provided', () => {
      expect(isDobValid('es-MX', '25/12/2000')).toBe(true);
    });

    it('should return false for a date in the future', () => {
      expect(isDobValid('es-MX', twentyFourHoursFromNowIso)).toBe(false);
    });

    it('should return false for a date before 1900', () => {
      expect(isDobValid('es-MX', '1899-12-31')).toBe(false);
    });

    it('should return false for a date that is too young < 18 years', () => {
      expect(isDobValid('es-MX', seventeenYearsAgoIso)).toBe(false);
    });
  });
});
