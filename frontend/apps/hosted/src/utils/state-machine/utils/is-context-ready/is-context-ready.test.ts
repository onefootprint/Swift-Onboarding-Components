import {
  BusinessBoKycData,
  CLIENT_PUBLIC_KEY_HEADER,
  CollectedKycDataOption,
  KYB_BO_SESSION_AUTHORIZATION_HEADER,
  OnboardingConfig,
} from '@onefootprint/types';

import { MachineContext, MachineEvents } from '../../types';
import isContextReady from './is-context-ready';

describe('isContextReady', () => {
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
      const context: MachineContext = {
        obConfigAuth: { [CLIENT_PUBLIC_KEY_HEADER]: 'token' },
        businessBoKycData: testBusinessBoKycData,
        onboardingConfig: testOnboardingConfig,
      };
      const event: MachineEvents = {
        type: 'initContextUpdated',
        payload: {},
      };
      expect(isContextReady(context, event)).toEqual(true);
    });

    it('when some data is in the machine context and some in the event payload', () => {
      const context: MachineContext = {
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
