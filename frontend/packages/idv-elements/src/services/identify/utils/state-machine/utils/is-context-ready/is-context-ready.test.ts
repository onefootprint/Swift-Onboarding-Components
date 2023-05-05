import {
  CLIENT_PUBLIC_KEY_HEADER,
  CollectedKycDataOption,
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

  describe('when init context info is complete', () => {
    it('when all data is in the machine context', () => {
      const context: MachineContext = {
        device: {
          type: 'mobile',
          hasSupportForWebauthn: true,
        },
        obConfigAuth: { [CLIENT_PUBLIC_KEY_HEADER]: 'token' },
        config: { ...testOnboardingConfig },
        bootstrapData: {},
        identify: {},
        challenge: {},
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
        bootstrapData: {},
        identify: {},
        challenge: {},
        obConfigAuth: { [CLIENT_PUBLIC_KEY_HEADER]: 'token' },
      };
      const event: MachineEvents = {
        type: 'initContextUpdated',
        payload: {
          device: {
            type: 'mobile',
            hasSupportForWebauthn: true,
          },
        },
      };
      expect(isContextReady(context, event)).toEqual(true);
    });
  });

  describe('when init context is incomplete', () => {
    it('when context and payload have missing data', () => {
      const context: MachineContext = {
        bootstrapData: {},
        identify: {},
        challenge: {},
        obConfigAuth: { [CLIENT_PUBLIC_KEY_HEADER]: 'token' },
      };
      const event: MachineEvents = {
        type: 'initContextUpdated',
        payload: {
          device: {
            type: 'mobile',
            hasSupportForWebauthn: true,
          },
        },
      };
      expect(isContextReady(context, event)).toEqual(false);
    });
  });
});
