import { describe, expect, it } from 'bun:test';
import type { PublicOnboardingConfig } from '@onefootprint/types';
import { OnboardingConfigStatus } from '@onefootprint/types';

import type { MachineContext, MachineEvents } from '../../types';
import initContextComplete from './init-context-complete';

describe('initContextComplete', () => {
  const TestOnboardingConfig: PublicOnboardingConfig = {
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
    allowInternationalResidents: false,
  };

  describe('when init context info is complete', () => {
    it('when all data is in the machine context', () => {
      const context: MachineContext = {
        authToken: 'token',
        opener: 'mobile',
        onboardingConfig: TestOnboardingConfig,
        updatedStatus: true,
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
        updatedStatus: true,
      };
      const event: MachineEvents = {
        type: 'initContextUpdated',
        payload: {
          onboardingConfig: TestOnboardingConfig,
          updatedStatus: true,
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
