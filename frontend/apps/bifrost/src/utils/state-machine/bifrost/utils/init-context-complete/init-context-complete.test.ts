import { CollectedKycDataOption, IdentifyType } from '@onefootprint/types';

import { BifrostContext, BifrostEvent, Events } from '../../types';
import initContextComplete from './init-context-complete';

describe('initContextComplete', () => {
  describe('when init context info is complete', () => {
    it('when all data is in the machine context', () => {
      const context: BifrostContext = {
        device: {
          type: 'mobile',
          hasSupportForWebauthn: true,
        },
        identifyType: IdentifyType.my1fp,
        tenant: {
          isLive: true,
          pk: 'key',
          name: 'tenant',
          mustCollectData: [CollectedKycDataOption.name],
          canAccessData: [CollectedKycDataOption.name],
          orgName: 'tenantOrg',
        },
      };
      const event: BifrostEvent = {
        type: Events.initContextUpdated,
        payload: {},
      };
      expect(initContextComplete(context, event)).toEqual(true);
    });

    it('when some data is in the machine context and some in the event payload', () => {
      const context: BifrostContext = {
        identifyType: IdentifyType.my1fp,
        tenant: {
          isLive: true,
          pk: 'key',
          name: 'tenant',
          mustCollectData: [CollectedKycDataOption.name],
          canAccessData: [CollectedKycDataOption.name],
          orgName: 'tenantOrg',
        },
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
        tenant: {
          isLive: true,
          pk: 'key',
          name: 'tenant',
          mustCollectData: [CollectedKycDataOption.name],
          canAccessData: [CollectedKycDataOption.name],
          orgName: 'tenantOrg',
        },
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
