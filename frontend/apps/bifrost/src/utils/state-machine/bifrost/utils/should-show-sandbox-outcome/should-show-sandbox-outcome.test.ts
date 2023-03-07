import { CollectedKycDataOption, OnboardingConfig } from '@onefootprint/types';

import { BifrostContext, BifrostEvent, Events } from '../../types';
import shouldShowSandboxOutcome from './should-show-sandbox-outcome';

describe('shouldShowSandboxOutcome', () => {
  const testOnboardingConfig: OnboardingConfig = {
    createdAt: 'date',
    id: 'id',
    isLive: true,
    key: 'key',
    logoUrl: 'url',
    privacyPolicyUrl: 'url',
    name: 'tenant',
    orgName: 'tenantOrg',
    status: 'enabled',
    mustCollectData: [CollectedKycDataOption.name],
    canAccessData: [CollectedKycDataOption.name],
  };

  describe('when init context info is complete', () => {
    it('should return true if key is not live', () => {
      const context: BifrostContext = {
        device: {
          type: 'mobile',
          hasSupportForWebauthn: true,
        },
        config: { ...testOnboardingConfig, isLive: false },
        bootstrapData: {},
      };
      const event: BifrostEvent = {
        type: Events.initContextUpdated,
        payload: {},
      };
      expect(shouldShowSandboxOutcome(context, event)).toEqual(true);
    });

    it('should return false if key is live', () => {
      const context: BifrostContext = {
        config: { ...testOnboardingConfig, isLive: true },
        bootstrapData: {},
      };
      const event: BifrostEvent = {
        type: Events.initContextUpdated,
        payload: {
          device: {
            type: 'mobile',
            hasSupportForWebauthn: true,
          },
        },
      };
      expect(shouldShowSandboxOutcome(context, event)).toEqual(false);
    });
  });

  describe('when init context is incomplete', () => {
    it('should return false', () => {
      const context: BifrostContext = {
        bootstrapData: {},
      };
      const event: BifrostEvent = {
        type: Events.initContextUpdated,
        payload: {
          device: {
            type: 'mobile',
            hasSupportForWebauthn: true,
          },
        },
      };
      expect(shouldShowSandboxOutcome(context, event)).toEqual(false);
    });
  });
});
