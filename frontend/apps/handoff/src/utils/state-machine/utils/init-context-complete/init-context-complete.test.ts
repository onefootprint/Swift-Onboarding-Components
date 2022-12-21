import { Events, MachineContext, MachineEvents } from '../../types';
import initContextComplete from './init-context-complete';

describe('initContextComplete', () => {
  describe('when init context info is complete', () => {
    it('when all data is in the machine context', () => {
      const context: MachineContext = {
        device: {
          type: 'mobile',
          hasSupportForWebauthn: true,
        },
        authToken: 'token',
      };
      const event: MachineEvents = {
        type: Events.initContextUpdated,
        payload: {},
      };
      expect(initContextComplete(context, event)).toEqual(true);
    });

    it('when some data is in the machine context and some in the event payload', () => {
      const context: MachineContext = {
        authToken: 'token',
      };
      const event: MachineEvents = {
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
      const context: MachineContext = {};
      const event: MachineEvents = {
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
