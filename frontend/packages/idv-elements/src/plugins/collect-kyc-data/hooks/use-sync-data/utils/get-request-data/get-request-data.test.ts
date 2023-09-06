import {
  CollectedKycDataOption,
  IdDI,
  OnboardingRequirementKind,
  UsLegalStatus,
  VisaKind,
} from '@onefootprint/types';

import getRequestData from './get-request-data';

describe('getRequestData', () => {
  it('does not try to complete cdos if speculative', () => {
    expect(
      getRequestData(
        {
          [IdDI.email]: {
            value: 'piip@onefootprint.com',
          },
          [IdDI.dob]: {
            value: '01/02/2003',
          },
          [IdDI.firstName]: {
            value: 'Piip',
            decrypted: true,
          },
          [IdDI.lastName]: {
            value: 'Foot',
          },
          [IdDI.ssn4]: {
            value: '1234',
          },
          [IdDI.addressLine1]: {
            value: '123 Main St',
            decrypted: true,
          },
          [IdDI.city]: {
            value: 'New York',
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
            CollectedKycDataOption.email,
            CollectedKycDataOption.address,
            CollectedKycDataOption.name,
            CollectedKycDataOption.dob,
          ],
          populatedAttributes: [],
          optionalAttributes: [CollectedKycDataOption.ssn4],
          isMet: false,
        },
      ),
    ).toEqual({
      [IdDI.email]: 'piip@onefootprint.com',
      [IdDI.dob]: '2003-01-02',
      [IdDI.lastName]: 'Foot',
      [IdDI.ssn4]: '1234',
      [IdDI.city]: 'New York',
      [IdDI.country]: 'US',
    });
  });

  it('removes entries with undefined values', () => {
    expect(
      getRequestData(
        {
          [IdDI.email]: {
            value: undefined,
          },
          [IdDI.firstName]: {
            value: '',
          },
          [IdDI.lastName]: {
            value: 'Foot',
          },
        },
        {
          kind: OnboardingRequirementKind.collectKycData,
          missingAttributes: [CollectedKycDataOption.name],
          populatedAttributes: [],
          optionalAttributes: [],
          isMet: false,
        },
        true,
      ),
    ).toEqual({
      [IdDI.firstName]: '',
      [IdDI.lastName]: 'Foot',
    });
  });

  it('formats dob and visa expiration data correctly', () => {
    expect(
      getRequestData(
        {
          [IdDI.dob]: {
            value: '01/02/2003',
          },
          [IdDI.nationality]: {
            value: 'US',
          },
          [IdDI.usLegalStatus]: {
            value: UsLegalStatus.citizen,
          },
          [IdDI.citizenships]: {
            value: ['US', 'MX'],
          },
          [IdDI.visaKind]: {
            value: VisaKind.f1,
          },
          [IdDI.visaExpirationDate]: {
            value: '01/02/2003',
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
        true,
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
        {
          [IdDI.email]: {
            value: 'piip@onefootprint.com',
          },
          [IdDI.firstName]: {
            value: 'Piip',
            decrypted: true,
          },
          [IdDI.lastName]: {
            value: 'Foot',
          },
          [IdDI.ssn4]: {
            value: '1234',
          },
          [IdDI.addressLine1]: {
            value: '123 Main St',
            decrypted: true,
          },
          [IdDI.city]: {
            value: 'New York',
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
            CollectedKycDataOption.email,
            CollectedKycDataOption.address,
            CollectedKycDataOption.name,
          ],
          populatedAttributes: [],
          optionalAttributes: [CollectedKycDataOption.ssn4],
          isMet: false,
        },
        true,
      ),
    ).toEqual({
      [IdDI.email]: 'piip@onefootprint.com',
      [IdDI.firstName]: 'Piip',
      [IdDI.lastName]: 'Foot',
      [IdDI.ssn4]: '1234',
      [IdDI.addressLine1]: '123 Main St',
      [IdDI.city]: 'New York',
      [IdDI.state]: 'NY',
      [IdDI.zip]: '10001',
      [IdDI.country]: 'US',
    });
  });

  it('if it cannot match cdos because data collection is incomplete, throws errors', () => {
    expect(() =>
      getRequestData(
        {
          [IdDI.email]: {
            value: 'piip@onefootprint.com',
          },
          [IdDI.firstName]: {
            value: 'Piip',
            decrypted: true,
          },
          [IdDI.ssn4]: {
            value: '1234',
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
            CollectedKycDataOption.email,
            CollectedKycDataOption.address,
            CollectedKycDataOption.name,
          ],
          populatedAttributes: [],
          optionalAttributes: [CollectedKycDataOption.ssn4],
          isMet: false,
        },
        true,
      ),
    ).toThrowError();
  });

  it('removes decrypted values', () => {
    expect(
      getRequestData(
        {
          [IdDI.email]: {
            value: 'piip@onefootprint.com',
          },
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
          },
        },
        {
          kind: OnboardingRequirementKind.collectKycData,
          missingAttributes: [CollectedKycDataOption.email],
          populatedAttributes: [
            CollectedKycDataOption.name,
            CollectedKycDataOption.ssn4,
          ],
          optionalAttributes: [],
          isMet: true,
        },
        true,
      ),
    ).toEqual({
      [IdDI.email]: 'piip@onefootprint.com',
      [IdDI.ssn4]: '1234',
    });
  });

  it('removes scrubbed values', () => {
    expect(
      getRequestData(
        {
          [IdDI.email]: {
            value: 'piip@onefootprint.com',
          },
          [IdDI.firstName]: {
            value: 'Piip',
          },
          [IdDI.lastName]: {
            value: 'Foot',
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
        true,
      ),
    ).toEqual({
      [IdDI.email]: 'piip@onefootprint.com',
      [IdDI.firstName]: 'Piip',
      [IdDI.lastName]: 'Foot',
    });
  });
});
