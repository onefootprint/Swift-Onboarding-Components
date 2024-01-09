import {
  CollectedKycDataOption,
  IdDI,
  OnboardingRequirementKind,
  UsLegalStatus,
  VisaKind,
} from '@onefootprint/types';

import getCurrentStepFromMissingAttributes from './current-step-from-missing-attributes';

describe('getCurrentStepFromMissingAttributes', () => {
  it('returns 0 when there are no missing attributes', () => {
    expect(
      getCurrentStepFromMissingAttributes(
        {
          kind: OnboardingRequirementKind.collectKycData,
          isMet: false,
          missingAttributes: [],
          populatedAttributes: [],
          optionalAttributes: [],
        },
        {},
        'basicInformation',
      ),
    ).toEqual(0);

    expect(
      getCurrentStepFromMissingAttributes(
        {
          kind: OnboardingRequirementKind.collectKycData,
          isMet: false,
          missingAttributes: [],
          populatedAttributes: [],
          optionalAttributes: [],
        },
        {},
        'residentialAddress',
      ),
    ).toEqual(0);

    expect(
      getCurrentStepFromMissingAttributes(
        {
          kind: OnboardingRequirementKind.collectKycData,
          isMet: false,
          missingAttributes: [],
          populatedAttributes: [],
          optionalAttributes: [],
        },
        {},
        'usLegalStatus',
      ),
    ).toEqual(0);

    expect(
      getCurrentStepFromMissingAttributes(
        {
          kind: OnboardingRequirementKind.collectKycData,
          isMet: false,
          missingAttributes: [],
          populatedAttributes: [],
          optionalAttributes: [],
        },
        {},
        'ssn',
      ),
    ).toEqual(0);

    expect(
      getCurrentStepFromMissingAttributes(
        {
          kind: OnboardingRequirementKind.collectKycData,
          isMet: false,
          missingAttributes: [],
          populatedAttributes: [],
          optionalAttributes: [],
        },
        {},
        'confirm',
      ),
    ).toEqual(0);
  });

  it('returns 1 if showing the page with only missing or optional attribute', () => {
    expect(
      getCurrentStepFromMissingAttributes(
        {
          kind: OnboardingRequirementKind.collectKycData,
          isMet: false,
          missingAttributes: [CollectedKycDataOption.address],
          populatedAttributes: [],
          optionalAttributes: [],
        },
        {},
        'residentialAddress',
      ),
    ).toEqual(1);

    expect(
      getCurrentStepFromMissingAttributes(
        {
          kind: OnboardingRequirementKind.collectKycData,
          isMet: false,
          missingAttributes: [CollectedKycDataOption.usLegalStatus],
          populatedAttributes: [],
          optionalAttributes: [],
        },
        {},
        'usLegalStatus',
      ),
    ).toEqual(1);

    expect(
      getCurrentStepFromMissingAttributes(
        {
          kind: OnboardingRequirementKind.collectKycData,
          isMet: false,
          missingAttributes: [CollectedKycDataOption.ssn4],
          populatedAttributes: [],
          optionalAttributes: [],
        },
        {},
        'ssn',
      ),
    ).toEqual(1);

    expect(
      getCurrentStepFromMissingAttributes(
        {
          kind: OnboardingRequirementKind.collectKycData,
          isMet: false,
          missingAttributes: [],
          populatedAttributes: [],
          optionalAttributes: [CollectedKycDataOption.ssn9],
        },
        {},
        'ssn',
      ),
    ).toEqual(1);

    expect(
      getCurrentStepFromMissingAttributes(
        {
          kind: OnboardingRequirementKind.collectKycData,
          isMet: false,
          missingAttributes: [CollectedKycDataOption.address],
          populatedAttributes: [],
          optionalAttributes: [],
        },
        {},
        'confirm',
      ),
    ).toEqual(1);
  });

  it('calculates correctly with multiple missing attributes and pages', () => {
    expect(
      getCurrentStepFromMissingAttributes(
        {
          kind: OnboardingRequirementKind.collectKycData,
          isMet: false,
          missingAttributes: [
            CollectedKycDataOption.name,
            CollectedKycDataOption.address,
          ],
          populatedAttributes: [],
          optionalAttributes: [],
        },
        {},
        'basicInformation',
      ),
    ).toEqual(1);

    expect(
      getCurrentStepFromMissingAttributes(
        {
          kind: OnboardingRequirementKind.collectKycData,
          isMet: false,
          missingAttributes: [
            CollectedKycDataOption.name,
            CollectedKycDataOption.address,
          ],
          populatedAttributes: [],
          optionalAttributes: [],
        },
        {},
        'ssn',
      ),
    ).toEqual(2);

    expect(
      getCurrentStepFromMissingAttributes(
        {
          kind: OnboardingRequirementKind.collectKycData,
          isMet: false,
          missingAttributes: [
            CollectedKycDataOption.dob,
            CollectedKycDataOption.address,
          ],
          populatedAttributes: [],
          optionalAttributes: [],
        },
        {},
        'residentialAddress',
      ),
    ).toEqual(2);

    expect(
      getCurrentStepFromMissingAttributes(
        {
          kind: OnboardingRequirementKind.collectKycData,
          isMet: false,
          missingAttributes: [
            CollectedKycDataOption.dob,
            CollectedKycDataOption.address,
            CollectedKycDataOption.usLegalStatus,
          ],
          populatedAttributes: [],
          optionalAttributes: [],
        },
        {},
        'usLegalStatus',
      ),
    ).toEqual(3);

    expect(
      getCurrentStepFromMissingAttributes(
        {
          kind: OnboardingRequirementKind.collectKycData,
          isMet: false,
          missingAttributes: [
            CollectedKycDataOption.dob,
            CollectedKycDataOption.address,
          ],
          populatedAttributes: [],
          optionalAttributes: [],
        },
        {},
        'ssn',
      ),
    ).toEqual(2);

    expect(
      getCurrentStepFromMissingAttributes(
        {
          kind: OnboardingRequirementKind.collectKycData,
          isMet: false,
          missingAttributes: [
            CollectedKycDataOption.dob,
            CollectedKycDataOption.address,
          ],
          populatedAttributes: [],
          optionalAttributes: [],
        },
        {},
        'confirm',
      ),
    ).toEqual(2);

    expect(
      getCurrentStepFromMissingAttributes(
        {
          kind: OnboardingRequirementKind.collectKycData,
          isMet: false,
          missingAttributes: [CollectedKycDataOption.dob],
          populatedAttributes: [],
          optionalAttributes: [CollectedKycDataOption.ssn4],
        },
        {},
        'ssn',
      ),
    ).toEqual(2);
  });

  it('calculates correctly when initData is populated', () => {
    expect(
      getCurrentStepFromMissingAttributes(
        {
          kind: OnboardingRequirementKind.collectKycData,
          isMet: false,
          missingAttributes: [
            CollectedKycDataOption.name,
            CollectedKycDataOption.address,
          ],
          populatedAttributes: [],
          optionalAttributes: [],
        },
        {
          [IdDI.firstName]: { value: 'John' },
          [IdDI.middleName]: { value: 'M.' },
          [IdDI.lastName]: { value: 'LastName' },
          [IdDI.dob]: { value: '1990-01-01' },
          [IdDI.addressLine1]: { value: '123 Main St' },
          [IdDI.city]: { value: 'New York' },
          [IdDI.state]: { value: 'NY' },
          [IdDI.zip]: { value: '10001' },
          [IdDI.country]: { value: 'US' },
        },
        'basicInformation',
      ),
    ).toEqual(0);

    expect(
      getCurrentStepFromMissingAttributes(
        {
          kind: OnboardingRequirementKind.collectKycData,
          isMet: false,
          missingAttributes: [
            CollectedKycDataOption.name,
            CollectedKycDataOption.address,
          ],
          populatedAttributes: [],
          optionalAttributes: [],
        },
        {
          [IdDI.firstName]: { value: 'John' },
          [IdDI.middleName]: { value: 'M.' },
          [IdDI.lastName]: { value: 'LastName' },
          [IdDI.dob]: { value: '1990-01-01' },
          [IdDI.addressLine1]: { value: '123 Main St' },
          [IdDI.city]: { value: 'New York' },
          [IdDI.state]: { value: 'NY' },
          [IdDI.zip]: { value: '10001' },
          [IdDI.country]: { value: 'US' },
        },
        'residentialAddress',
      ),
    ).toEqual(0);

    expect(
      getCurrentStepFromMissingAttributes(
        {
          kind: OnboardingRequirementKind.collectKycData,
          isMet: false,
          missingAttributes: [
            CollectedKycDataOption.name,
            CollectedKycDataOption.address,
          ],
          populatedAttributes: [],
          optionalAttributes: [],
        },
        {
          [IdDI.firstName]: { value: 'John' },
          [IdDI.lastName]: { value: 'John' },
          [IdDI.dob]: { value: '1990-01-01' },
          [IdDI.addressLine1]: { value: '123 Main St' },
          [IdDI.city]: { value: 'New York' },
          [IdDI.state]: { value: 'NY' },
          [IdDI.zip]: { value: '10001' },
          [IdDI.country]: { value: 'US' },
        },
        'confirm',
      ),
    ).toEqual(0);

    expect(
      getCurrentStepFromMissingAttributes(
        {
          kind: OnboardingRequirementKind.collectKycData,
          isMet: false,
          missingAttributes: [
            CollectedKycDataOption.name,
            CollectedKycDataOption.address,
          ],
          populatedAttributes: [],
          optionalAttributes: [CollectedKycDataOption.ssn4],
        },
        {
          [IdDI.firstName]: { value: 'John' },
          [IdDI.lastName]: { value: 'John' },
          [IdDI.dob]: { value: '1990-01-01' },
          [IdDI.addressLine1]: { value: '123 Main St' },
          [IdDI.city]: { value: 'New York' },
          [IdDI.state]: { value: 'NY' },
          [IdDI.zip]: { value: '10001' },
          [IdDI.country]: { value: 'US' },
          [IdDI.usLegalStatus]: { value: UsLegalStatus.visa },
          [IdDI.nationality]: { value: 'IT' },
          [IdDI.citizenships]: { value: ['FR'] },
          [IdDI.visaKind]: { value: VisaKind.h1b },
          [IdDI.visaExpirationDate]: { value: '2050-01-01' },
          [IdDI.ssn4]: { value: '1234' },
        },
        'confirm',
      ),
    ).toEqual(0);
  });
});
