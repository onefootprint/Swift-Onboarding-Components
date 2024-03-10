import {
  CollectedKycDataOption,
  IdDI,
  OnboardingRequirementKind,
  UsLegalStatus,
  VisaKind,
} from '@onefootprint/types';

import getRequestData from './get-request-data';

describe('getRequestData', () => {
  it('removes entries with undefined values', () => {
    expect(
      getRequestData(
        'en-US',
        {
          [IdDI.firstName]: {
            value: '',
            dirty: true,
          },
          [IdDI.middleName]: {
            value: undefined,
          },
          [IdDI.lastName]: {
            value: 'Foot',
            dirty: true,
          },
        },
        {
          kind: OnboardingRequirementKind.collectKycData,
          missingAttributes: [CollectedKycDataOption.name],
          populatedAttributes: [],
          optionalAttributes: [],
          isMet: false,
        },
      ),
    ).toEqual({
      [IdDI.firstName]: '',
      [IdDI.lastName]: 'Foot',
    });
  });

  it('keeps entries with empty strings', () => {
    expect(
      getRequestData(
        'en-US',
        {
          [IdDI.addressLine1]: {
            value: '123 main st',
          },
          [IdDI.addressLine2]: {
            value: '',
            dirty: true,
          },
          [IdDI.city]: {
            value: 'San francisco',
          },
          [IdDI.state]: {
            value: 'CA',
          },
          [IdDI.zip]: {
            value: '12345',
          },
          [IdDI.country]: {
            value: 'US',
          },
        },
        {
          kind: OnboardingRequirementKind.collectKycData,
          missingAttributes: [
            CollectedKycDataOption.name,
            CollectedKycDataOption.address,
          ],
          populatedAttributes: [],
          optionalAttributes: [],
          isMet: false,
        },
      ),
    ).toEqual({
      [IdDI.addressLine1]: '123 main st',
      [IdDI.addressLine2]: '',
      [IdDI.city]: 'San francisco',
      [IdDI.state]: 'CA',
      [IdDI.zip]: '12345',
      [IdDI.country]: 'US',
    });
  });

  it('removes non-dirty entries', () => {
    expect(
      getRequestData(
        'en-US',
        {
          [IdDI.dob]: {
            value: '123',
          },
          [IdDI.firstName]: {
            value: '123',
            dirty: true,
          },
          [IdDI.lastName]: {
            value: 'Foot',
            dirty: true,
          },
        },
        {
          kind: OnboardingRequirementKind.collectKycData,
          missingAttributes: [
            CollectedKycDataOption.dob,
            CollectedKycDataOption.name,
          ],
          populatedAttributes: [],
          optionalAttributes: [],
          isMet: false,
        },
      ),
    ).toEqual({
      [IdDI.firstName]: '123',
      [IdDI.lastName]: 'Foot',
    });
  });

  it('formats dob and visa expiration data correctly', () => {
    expect(
      getRequestData(
        'en-US',
        {
          [IdDI.dob]: {
            value: '01/02/2003',
            dirty: true,
          },
          [IdDI.nationality]: {
            value: 'US',
            dirty: true,
          },
          [IdDI.usLegalStatus]: {
            value: UsLegalStatus.citizen,
            dirty: true,
          },
          [IdDI.citizenships]: {
            value: ['US', 'MX'],
            dirty: true,
          },
          [IdDI.visaKind]: {
            value: VisaKind.f1,
            dirty: true,
          },
          [IdDI.visaExpirationDate]: {
            value: '01/02/2003',
            dirty: true,
          },
        },
        {
          kind: OnboardingRequirementKind.collectKycData,
          missingAttributes: [
            CollectedKycDataOption.dob,
            CollectedKycDataOption.usLegalStatus,
          ],
          populatedAttributes: [],
          optionalAttributes: [],
          isMet: false,
        },
      ),
    ).toEqual({
      [IdDI.dob]: '2003-01-02',
      [IdDI.nationality]: 'US',
      [IdDI.citizenships]: ['US', 'MX'],
      [IdDI.usLegalStatus]: 'citizen',
      [IdDI.visaKind]: 'f1',
      [IdDI.visaExpirationDate]: '2003-01-02',
    });
  });

  it('matches cdos if there are any dangling dis', () => {
    expect(
      getRequestData(
        'en-US',
        {
          [IdDI.firstName]: {
            value: 'Piip',
            decrypted: true,
            dirty: true,
          },
          [IdDI.lastName]: {
            value: 'Foot',
            dirty: true,
          },
          [IdDI.ssn4]: {
            value: '1234',
            dirty: true,
          },
          [IdDI.addressLine1]: {
            value: '123 Main St',
            decrypted: true,
            dirty: true,
          },
          [IdDI.city]: {
            value: 'New York',
            dirty: true,
          },
          [IdDI.state]: {
            value: 'NY',
            decrypted: true,
          },
          [IdDI.zip]: {
            value: '10001',
            decrypted: true,
          },
          [IdDI.country]: {
            value: 'US',
            bootstrap: true,
          },
        },
        {
          kind: OnboardingRequirementKind.collectKycData,
          missingAttributes: [
            CollectedKycDataOption.address,
            CollectedKycDataOption.name,
          ],
          populatedAttributes: [],
          optionalAttributes: [CollectedKycDataOption.ssn4],
          isMet: false,
        },
      ),
    ).toEqual({
      [IdDI.firstName]: 'Piip',
      [IdDI.lastName]: 'Foot',
      [IdDI.ssn4]: '1234',
      [IdDI.addressLine1]: '123 Main St',
      [IdDI.city]: 'New York',
      [IdDI.state]: 'NY',
      [IdDI.zip]: '10001',
      [IdDI.country]: 'US',
    });

    expect(
      getRequestData(
        'en-US',
        {
          [IdDI.firstName]: {
            value: 'Piip',
            decrypted: true,
          },
          [IdDI.middleName]: {
            value: 'Middle',
            dirty: true,
          },
          [IdDI.lastName]: {
            value: 'Foot',
            decrypted: true,
          },
        },
        {
          kind: OnboardingRequirementKind.collectKycData,
          missingAttributes: [CollectedKycDataOption.name],
          populatedAttributes: [],
          optionalAttributes: [],
          isMet: false,
        },
      ),
    ).toEqual({
      [IdDI.firstName]: 'Piip',
      [IdDI.middleName]: 'Middle',
      [IdDI.lastName]: 'Foot',
    });
  });

  it('if it cannot match cdos because data collection is incomplete, throws errors', () => {
    expect(() =>
      getRequestData(
        'en-US',
        {
          [IdDI.firstName]: {
            value: 'Piip',
            dirty: true,
          },
          [IdDI.ssn4]: {
            value: '1234',
            dirty: true,
          },
          [IdDI.addressLine1]: {
            value: '1234 main st',
            decrypted: true,
          },
          [IdDI.country]: {
            value: 'US',
            bootstrap: true,
          },
        },
        {
          kind: OnboardingRequirementKind.collectKycData,
          missingAttributes: [
            CollectedKycDataOption.address,
            CollectedKycDataOption.name,
          ],
          populatedAttributes: [],
          optionalAttributes: [CollectedKycDataOption.ssn4],
          isMet: false,
        },
      ),
    ).toThrow();

    expect(() =>
      getRequestData(
        'en-US',
        {
          [IdDI.middleName]: {
            value: 'Middle',
            dirty: true,
          },
          [IdDI.lastName]: {
            value: 'Foot',
            decrypted: true,
          },
        },
        {
          kind: OnboardingRequirementKind.collectKycData,
          missingAttributes: [CollectedKycDataOption.name],
          populatedAttributes: [],
          optionalAttributes: [],
          isMet: false,
        },
      ),
    ).toThrow();
  });

  it('does not error if zip/state/city are missing for international addresses', () => {
    // Missing required city field
    expect(() =>
      getRequestData(
        'en-US',
        {
          [IdDI.addressLine1]: {
            value: '1234 main st',
            dirty: true,
          },
          [IdDI.state]: {
            value: 'State',
            decrypted: true,
          },
          [IdDI.zip]: {
            value: '1234',
            decrypted: true,
          },
          [IdDI.country]: {
            value: 'MX',
            bootstrap: true,
          },
        },
        {
          kind: OnboardingRequirementKind.collectKycData,
          missingAttributes: [CollectedKycDataOption.address],
          populatedAttributes: [],
          optionalAttributes: [],
          isMet: false,
        },
      ),
    ).toThrow();

    // Missing state / zip fields
    expect(() =>
      getRequestData(
        'en-US',
        {
          [IdDI.addressLine1]: {
            value: '1234 main st',
            dirty: true,
          },
          [IdDI.city]: {
            value: '1234 main st',
            decrypted: true,
          },
          [IdDI.state]: {
            value: 'State',
            decrypted: true,
          },
          [IdDI.country]: {
            value: 'MX',
            bootstrap: true,
          },
        },
        {
          kind: OnboardingRequirementKind.collectKycData,
          missingAttributes: [CollectedKycDataOption.address],
          populatedAttributes: [],
          optionalAttributes: [],
          isMet: false,
        },
      ),
    ).not.toThrow();

    // Missing state / zip fields
    expect(() =>
      getRequestData(
        'en-US',
        {
          [IdDI.addressLine1]: {
            value: '1234 main st',
            dirty: true,
          },
          [IdDI.city]: {
            value: '1234 main st',
            decrypted: true,
          },
          [IdDI.zip]: {
            value: '12324',
            decrypted: true,
          },
          [IdDI.country]: {
            value: 'MX',
            bootstrap: true,
          },
        },
        {
          kind: OnboardingRequirementKind.collectKycData,
          missingAttributes: [CollectedKycDataOption.address],
          populatedAttributes: [],
          optionalAttributes: [],
          isMet: false,
        },
      ),
    ).not.toThrow();
  });

  it('removes decrypted values if they form full cdos', () => {
    expect(
      getRequestData(
        'en-US',
        {
          [IdDI.firstName]: {
            value: 'Piip',
            decrypted: true,
          },
          [IdDI.lastName]: {
            value: 'Foot',
            decrypted: true,
          },
          [IdDI.ssn4]: {
            value: '1234',
            dirty: true,
          },
        },
        {
          kind: OnboardingRequirementKind.collectKycData,
          missingAttributes: [],
          populatedAttributes: [
            CollectedKycDataOption.name,
            CollectedKycDataOption.ssn4,
          ],
          optionalAttributes: [],
          isMet: true,
        },
      ),
    ).toEqual({
      [IdDI.ssn4]: '1234',
    });
  });

  it('removes scrubbed values', () => {
    expect(
      getRequestData(
        'en-US',
        {
          [IdDI.firstName]: {
            value: 'Piip',
          },
          [IdDI.lastName]: {
            value: 'Foot',
            dirty: true,
          },
          [IdDI.ssn4]: {
            value: undefined,
            scrubbed: true,
          },
        },
        {
          kind: OnboardingRequirementKind.collectKycData,
          missingAttributes: [],
          populatedAttributes: [
            CollectedKycDataOption.name,
            CollectedKycDataOption.ssn4,
          ],
          optionalAttributes: [],
          isMet: true,
        },
      ),
    ).toEqual({
      [IdDI.firstName]: 'Piip',
      [IdDI.lastName]: 'Foot',
    });
  });

  it('omits populated but not decrypted requirements', () => {
    expect(
      getRequestData(
        'en-US',
        {
          [IdDI.firstName]: {
            value: 'Piip',
          },
          [IdDI.lastName]: {
            value: 'Foot',
            dirty: true,
          },
          [IdDI.ssn4]: {
            value: undefined,
            decrypted: true,
          },
        },
        {
          kind: OnboardingRequirementKind.collectKycData,
          missingAttributes: [],
          populatedAttributes: [
            CollectedKycDataOption.name,
            CollectedKycDataOption.ssn4,
          ],
          optionalAttributes: [],
          isMet: true,
        },
      ),
    ).toEqual({
      [IdDI.firstName]: 'Piip',
      [IdDI.lastName]: 'Foot',
    });
  });
});
