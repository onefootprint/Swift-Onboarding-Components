import { describe, expect, it } from 'bun:test';
import type { BusinessBoKycData, PublicOnboardingConfig } from '@onefootprint/types';
import {
  CLIENT_PUBLIC_KEY_HEADER,
  KYB_BO_SESSION_AUTHORIZATION_HEADER,
  OnboardingConfigStatus,
} from '@onefootprint/types';

import type { MachineContext, MachineEvents } from '../../types';
import isContextReady from './is-context-ready';

describe('isContextReady', () => {
  const testOnboardingConfig: PublicOnboardingConfig = {
    isLive: true,
    key: 'key',
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
    isKyb: false,
    allowInternationalResidents: false,
  };

  const testBusinessBoKycData: BusinessBoKycData = {
    name: 'biz',
    inviter: {
      firstName: 'firstName',
      lastName: 'lastName',
    },
    invited: {
      email: 'email',
      phoneNumber: 'phoneNumber',
    },
  };

  describe('when init context info is complete', () => {
    it('when all data is in the machine context', () => {
      let context: MachineContext = {
        obConfigAuth: { [CLIENT_PUBLIC_KEY_HEADER]: 'token' },
        businessBoKycData: testBusinessBoKycData,
        onboardingConfig: testOnboardingConfig,
      };
      const event: MachineEvents = {
        type: 'initContextUpdated',
        payload: {},
      };
      expect(isContextReady(context, event)).toEqual(true);

      context = {
        authToken: 'token',
        businessBoKycData: testBusinessBoKycData,
        onboardingConfig: testOnboardingConfig,
      };
      expect(isContextReady(context, event)).toEqual(true);
    });

    it('when some data is in the machine context and some in the event payload', () => {
      let context: MachineContext = {
        obConfigAuth: { [KYB_BO_SESSION_AUTHORIZATION_HEADER]: 'pk' },
      };
      const event: MachineEvents = {
        type: 'initContextUpdated',
        payload: {
          onboardingConfig: testOnboardingConfig,
          businessBoKycData: testBusinessBoKycData,
        },
      };
      expect(isContextReady(context, event)).toEqual(true);

      context = {
        authToken: 'token',
      };
      expect(isContextReady(context, event)).toEqual(true);
    });
  });

  describe('when init context is incomplete', () => {
    it('when context and payload have missing data', () => {
      const context: MachineContext = {
        obConfigAuth: { [CLIENT_PUBLIC_KEY_HEADER]: 'token' },
      };
      const event: MachineEvents = {
        type: 'initContextUpdated',
        payload: {},
      };
      expect(isContextReady(context, event)).toEqual(false);
    });
  });
});
