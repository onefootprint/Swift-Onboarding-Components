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
        },
        {},
        'confirm',
      ),
    ).toEqual(0);
  });

  it('returns 1 if showing the page with only missing attribute', () => {
    expect(
      getCurrentStepFromMissingAttributes(
        {
          kind: OnboardingRequirementKind.collectKycData,
          missingAttributes: [CollectedKycDataOption.partialAddress],
          populatedAttributes: [],
        },
        {},
        'residentialAddress',
      ),
    ).toEqual(1);

    expect(
      getCurrentStepFromMissingAttributes(
        {
          kind: OnboardingRequirementKind.collectKycData,
          missingAttributes: [CollectedKycDataOption.partialAddress],
          populatedAttributes: [],
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
        },
        {},
        'confirm',
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
  });
});
