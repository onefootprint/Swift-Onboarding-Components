import type { PublicOnboardingConfig } from '@onefootprint/types';
import { IdDI, OnboardingConfigStatus } from '@onefootprint/types';

import type { DIMetadata } from '../../../../../../types';
import validateBootstrapData, { isBeneficialOwnerValid } from './validate-bootstrap-data';

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
  it('should filter out invalid entries', () => {
    expect(validateBootstrapData({}, config, 'es-MX')).toEqual({});

    const d = <T>(value: T): DIMetadata<T> => ({
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
        config,
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
        config,
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
        config,
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
        config,
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
        config,
        'en-US',
      ),
    ).toEqual({
      [IdDI.country]: d('US'),
      [IdDI.state]: d('MA'),
      [IdDI.ssn9]: d('123-45-1234'),
    });

    expect(
      validateBootstrapData(
        {
          [IdDI.country]: d('MX'),
          [IdDI.state]: d('MA'),
          [IdDI.dob]: d('05-12-1996'),
          [IdDI.visaExpirationDate]: d('25-12-2030'),
          [IdDI.ssn9]: d('123-45-1234'),
        },
        config,
        'en-US',
      ),
    ).toEqual({
      [IdDI.state]: d('MA'),
      [IdDI.ssn9]: d('123-45-1234'),
    });
  });
});

describe('isBeneficialOwnerValid', () => {
  it('should return false if object is not provided', () => {
    expect(isBeneficialOwnerValid(undefined)).toBe(false);
  });

  it('should return true for a valid object', () => {
    const validObject = {
      first_name: 'John',
      middle_name: 'X',
      last_name: 'Doe',
      ownership_stake: 50,
      email: 'john.doe@example.com',
      phone_number: '+15555550100',
    };
    expect(isBeneficialOwnerValid(validObject)).toBe(true);
  });

  it('should return false for an object with invalid data', () => {
    const invalidObject = {
      first_name: 'Jane',
      last_name: 'Doe',
      ownership_stake: 150, // Stake exceeds 100
      email: 'jane.doe@example.com',
      phone_number: 'invalidPhoneNumber', // Invalid phone number
    };
    expect(isBeneficialOwnerValid(invalidObject)).toBe(false);
  });
});
