import { CollectedKycDataOption, OnboardingConfig } from '@onefootprint/types';

import { BifrostContext, BifrostEvent, Events } from '../../types';
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
    status: 'enabled',
    mustCollectData: [CollectedKycDataOption.name],
    mustCollectIdentityDocument: false,
    mustCollectSelfie: false,
    canAccessData: [CollectedKycDataOption.name],
    canAccessIdentityDocumentImages: false,
    canAccessSelfieImage: false,
  };

  describe('when init context info is complete', () => {
    it('when all data is in the machine context', () => {
      const context: BifrostContext = {
        device: {
          type: 'mobile',
          hasSupportForWebauthn: true,
        },
        config: { ...TestOnboardingConfig },
        bootstrapData: {},
      };
      const event: BifrostEvent = {
        type: Events.initContextUpdated,
        payload: {},
      };
      expect(initContextComplete(context, event)).toEqual(true);
    });

    it('when some data is in the machine context and some in the event payload', () => {
      const context: BifrostContext = {
        config: { ...TestOnboardingConfig },
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
      expect(initContextComplete(context, event)).toEqual(true);
    });
  });

  describe('when init context is incomplete', () => {
    it('when context and payload have missing data', () => {
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
      expect(initContextComplete(context, event)).toEqual(false);
    });
  });
});
