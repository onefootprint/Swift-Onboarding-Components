import { CollectedKycDataOption, OnboardingConfig } from '@onefootprint/types';

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
    isAppClipEnabled: false,
  };

  describe('when init context info is complete', () => {
    it('when all data is in the machine context', () => {
      const context: MachineContext = {
        authToken: 'token',
        device: {
          type: 'mobile',
          hasSupportForWebauthn: true,
        },
        config: { ...testOnboardingConfig },
        bootstrapData: {},
        validationToken: '',
      };
      const event: MachineEvents = {
        type: 'initContextUpdated',
        payload: {},
      };
      expect(isContextReady(context, event)).toEqual(true);
    });

    it('when some data is in the machine context and some in the event payload', () => {
      const context: MachineContext = {
        authToken: 'token',
        config: { ...testOnboardingConfig },
        bootstrapData: {},
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
        authToken: 'token',
        bootstrapData: {},
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
