import type { PublicOnboardingConfig } from '@onefootprint/types';
import { CLIENT_PUBLIC_KEY_HEADER, OnboardingConfigStatus } from '@onefootprint/types';

import type { MachineContext, MachineEvents } from '../../types';
import isContextReady from './is-context-ready';

describe('isContextReady', () => {
  const testOnboardingConfig: PublicOnboardingConfig = {
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
        device: {
          type: 'mobile',
          hasSupportForWebauthn: true,
          osName: 'iOS',
          browser: 'Mobile Safari',
        },
        config: { ...testOnboardingConfig },
        obConfigAuth: { [CLIENT_PUBLIC_KEY_HEADER]: 'token' },
        retries: 0,
        bootstrapData: {},
      };
      const event: MachineEvents = {
        type: 'initContextUpdated',
        payload: {},
      };
      expect(isContextReady(context, event)).toEqual(true);
    });

    it('when some data is in the machine context and some in the event payload', () => {
      const context: MachineContext = {
        config: { ...testOnboardingConfig },
        authToken: 'token',
        retries: 0,
        bootstrapData: {},
      };
      const event: MachineEvents = {
        type: 'initContextUpdated',
        payload: {
          device: {
            type: 'mobile',
            hasSupportForWebauthn: true,
            osName: 'iOS',
            browser: 'Mobile Safari',
          },
        },
      };
      expect(isContextReady(context, event)).toEqual(true);
    });
  });

  describe('when init context is incomplete', () => {
    it('when context and payload have missing data', () => {
      const context: MachineContext = {
        retries: 0,
        bootstrapData: {},
      };
      const event: MachineEvents = {
        type: 'initContextUpdated',
        payload: {
          device: {
            type: 'mobile',
            hasSupportForWebauthn: true,
            osName: 'iOS',
            browser: 'Mobile Safari',
          },
        },
      };
      expect(isContextReady(context, event)).toEqual(false);
    });
  });
});
