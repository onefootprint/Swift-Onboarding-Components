import {
  CollectedKycDataOption,
  IdDI,
  OnboardingRequirementKind,
} from '@onefootprint/types';

import getCurrentStepFromMissingAttributes from './current-step-from-missing-attributes';

describe('getCurrentStepFromMissingAttributes', () => {
  it('returns 0 when there are no missing attributes', () => {
    expect(
      getCurrentStepFromMissingAttributes(
        {
          kind: OnboardingRequirementKind.collectKycData,
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
          missingAttributes: [CollectedKycDataOption.partialAddress],
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
          missingAttributes: [CollectedKycDataOption.partialAddress],
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
          missingAttributes: [
            CollectedKycDataOption.name,
            CollectedKycDataOption.fullAddress,
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
          missingAttributes: [
            CollectedKycDataOption.name,
            CollectedKycDataOption.fullAddress,
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
          missingAttributes: [
            CollectedKycDataOption.dob,
            CollectedKycDataOption.fullAddress,
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
          missingAttributes: [
            CollectedKycDataOption.dob,
            CollectedKycDataOption.fullAddress,
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
          missingAttributes: [
            CollectedKycDataOption.dob,
            CollectedKycDataOption.fullAddress,
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
          missingAttributes: [
            CollectedKycDataOption.name,
            CollectedKycDataOption.fullAddress,
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
        'basicInformation',
      ),
    ).toEqual(0);

    expect(
      getCurrentStepFromMissingAttributes(
        {
          kind: OnboardingRequirementKind.collectKycData,
          missingAttributes: [
            CollectedKycDataOption.name,
            CollectedKycDataOption.fullAddress,
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
        'residentialAddress',
      ),
    ).toEqual(0);

    expect(
      getCurrentStepFromMissingAttributes(
        {
          kind: OnboardingRequirementKind.collectKycData,
          missingAttributes: [
            CollectedKycDataOption.name,
            CollectedKycDataOption.fullAddress,
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
          missingAttributes: [
            CollectedKycDataOption.name,
            CollectedKycDataOption.fullAddress,
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
          [IdDI.ssn4]: { value: '1234' },
        },
        'confirm',
      ),
    ).toEqual(0);
  });
});
