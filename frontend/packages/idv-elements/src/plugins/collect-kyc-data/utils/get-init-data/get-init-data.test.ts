import {
  CollectedKycDataOption,
  IdDI,
  OnboardingConfig,
  OnboardingConfigStatus,
} from '@onefootprint/types';

import getInitData from './get-init-data';

describe('getInitData', () => {
  const getTestOnboardingConfig = (
    mustCollectData?: CollectedKycDataOption[],
  ): OnboardingConfig => ({
    createdAt: 'date',
    id: 'id',
    isLive: true,
    key: 'key',
    logoUrl: 'url',
    privacyPolicyUrl: 'url',
    name: 'tenant',
    orgName: 'tenantOrg',
    status: OnboardingConfigStatus.enabled,
    mustCollectData: mustCollectData ?? [],
    canAccessData: mustCollectData ?? [],
    optionalData: [],
    isAppClipEnabled: false,
    isNoPhoneFlow: false,
  });

  it('should return an empty object if no bootstrap data is provided', () => {
    const config = getTestOnboardingConfig();
    expect(getInitData(config)).toEqual({});
    expect(getInitData(config, {}, [IdDI.email, IdDI.firstName])).toEqual({});
  });

  const bootstrapData = {
    [IdDI.email]: 'Email',
    [IdDI.firstName]: 'Name',
  };

  it('should return populated data if bootstrap data is provided', () => {
    const config = getTestOnboardingConfig([
      CollectedKycDataOption.email,
      CollectedKycDataOption.name,
    ]);

    expect(getInitData(config, bootstrapData)).toEqual({
      [IdDI.email]: {
        value: 'Email',
        bootstrap: true,
      },
      [IdDI.firstName]: {
        value: 'Name',
        bootstrap: true,
      },
    });
  });

  it('marks disabled fields', () => {
    const config = getTestOnboardingConfig([
      CollectedKycDataOption.email,
      CollectedKycDataOption.name,
    ]);

    expect(
      getInitData(config, bootstrapData, [IdDI.email, IdDI.firstName]),
    ).toEqual({
      [IdDI.email]: {
        value: 'Email',
        bootstrap: true,
        disabled: true,
      },
      [IdDI.firstName]: {
        value: 'Name',
        bootstrap: true,
        disabled: true,
      },
    });
  });

  it('only marks disabled fields that are in the bootstrap data', () => {
    const config = getTestOnboardingConfig([
      CollectedKycDataOption.email,
      CollectedKycDataOption.name,
    ]);

    expect(getInitData(config, bootstrapData, [IdDI.email, IdDI.city])).toEqual(
      {
        [IdDI.email]: {
          value: 'Email',
          bootstrap: true,
          disabled: true,
        },
        [IdDI.firstName]: {
          value: 'Name',
          bootstrap: true,
        },
      },
    );
  });

  it('filters out fields that are not in ob config must collect', () => {
    const config = getTestOnboardingConfig([
      CollectedKycDataOption.email,
      CollectedKycDataOption.name,
    ]);

    expect(
      getInitData(
        config,
        {
          ...bootstrapData,
          [IdDI.city]: 'City',
          [IdDI.state]: 'State',
        },
        [IdDI.email, IdDI.city],
      ),
    ).toEqual({
      [IdDI.email]: {
        value: 'Email',
        bootstrap: true,
        disabled: true,
      },
      [IdDI.firstName]: {
        value: 'Name',
        bootstrap: true,
      },
    });
  });
});
