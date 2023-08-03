import {
  CollectedKycDataOption,
  OnboardingConfig,
  OnboardingConfigStatus,
} from '@onefootprint/types';

import { MachineContext, MachineEvents } from '../../types';
import initContextComplete from './init-context-complete';

describe('initContextComplete', () => {
  const TestOnboardingConfig: OnboardingConfig = {
    createdAt: 'date',
    id: 'id',
    isLive: true,
    key: 'key',
    logoUrl: 'url',
    privacyPolicyUrl: 'url',
    name: 'tenant',
    orgName: 'tenantOrg',
    status: OnboardingConfigStatus.enabled,
    mustCollectData: [CollectedKycDataOption.name],
    canAccessData: [CollectedKycDataOption.name],
    isAppClipEnabled: false,
  };

  describe('when init context info is complete', () => {
    it('when all data is in the machine context', () => {
      const context: MachineContext = {
        authToken: 'token',
        opener: 'mobile',
        onboardingConfig: TestOnboardingConfig,
      };
      const event: MachineEvents = {
        type: 'initContextUpdated',
        payload: {},
      };
      expect(initContextComplete(context, event)).toEqual(true);
    });

    it('when some data is in the machine context and some in the event payload', () => {
      const context: MachineContext = {
        authToken: 'token',
        opener: 'mobile',
        onboardingConfig: TestOnboardingConfig,
      };
      const event: MachineEvents = {
        type: 'initContextUpdated',
        payload: {
          onboardingConfig: TestOnboardingConfig,
        },
      };
      expect(initContextComplete(context, event)).toEqual(true);
    });
  });

  describe('when init context is incomplete', () => {
    it('when context and payload have missing data', () => {
      const context: MachineContext = {};
      const event: MachineEvents = {
        type: 'initContextUpdated',
        payload: {
          onboardingConfig: TestOnboardingConfig,
        },
      };
      expect(initContextComplete(context, event)).toEqual(false);
    });
  });
});
