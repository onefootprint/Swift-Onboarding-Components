import type { CollectKycDataRequirement } from '@onefootprint/types';
import { CollectedKycDataOption, IdDI, OnboardingRequirementKind } from '@onefootprint/types';

import getInitData from './get-init-data';

const getRequirement = (
  missingAttributes: CollectedKycDataOption[],
  optionalAttributes: CollectedKycDataOption[],
  populatedAttributes: CollectedKycDataOption[],
): CollectKycDataRequirement => ({
  kind: OnboardingRequirementKind.collectKycData,
  isMet: false,
  missingAttributes,
  optionalAttributes,
  recollectAttributes: [],
  populatedAttributes,
});

describe('getInitData', () => {
  it('should return an empty object if no bootstrap data is provided', () => {
    expect(getInitData(getRequirement([], [], []), {})).toEqual({});
  });

  const userData = {
    [IdDI.email]: {
      value: 'Email',
      isBootstrap: false,
    },
    [IdDI.firstName]: {
      value: 'Name',
      isBootstrap: true,
    },
  };

  it('should return populated data if bootstrap data is provided', () => {
    const requirement = getRequirement([CollectedKycDataOption.name], [], [CollectedKycDataOption.email]);
    expect(getInitData(requirement, userData)).toEqual({
      [IdDI.email]: {
        value: 'Email',
        bootstrap: false,
      },
      [IdDI.firstName]: {
        value: 'Name',
        bootstrap: true,
        dirty: true,
      },
    });
  });

  it('filters out fields that are not in ob config must collect', () => {
    const requirement = getRequirement([CollectedKycDataOption.email, CollectedKycDataOption.name], [], []);
    expect(
      getInitData(requirement, {
        ...userData,
        [IdDI.city]: {
          value: 'City',
          isBootstrap: true,
        },
        [IdDI.state]: {
          value: 'State',
          isBootstrap: true,
        },
      }),
    ).toEqual({
      [IdDI.email]: {
        value: 'Email',
        bootstrap: false,
        dirty: true,
      },
      [IdDI.firstName]: {
        value: 'Name',
        bootstrap: true,
        dirty: true,
      },
    });
  });
});
