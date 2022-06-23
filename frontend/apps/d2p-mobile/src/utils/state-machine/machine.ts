import { assign, createMachine } from 'xstate';

import { Actions, D2PContext, D2PEvent, Events, States } from './types';

const d2pMobileMachine = createMachine<D2PContext, D2PEvent>(
  {
    id: 'd2pMachine',
    initial: States.init,
    context: {
      device: {
        type: 'mobile',
        hasSupportForWebAuthn: false,
      },
      authToken: '',
    },
    states: {
      [States.init]: {
        on: {
          [Events.authTokenGotten]: {
            actions: [Actions.assignAuthToken],
          },
          [Events.deviceInfoIdentified]: [
            {
              target: States.register,
              cond: (context, event) =>
                event.payload.type === 'mobile' &&
                event.payload.hasSupportForWebAuthn,
              actions: [Actions.assignDeviceInfo],
            },
            {
              target: States.unavailable,
              actions: [Actions.assignDeviceInfo],
            },
          ],
        },
      },
      [States.register]: {
        on: {
          [Events.registerFailed]: {
            target: States.registerRetry,
          },
          [Events.registerSucceeded]: {
            target: States.success,
          },
          [Events.canceled]: {
            target: States.canceled,
          },
          [Events.statusPollingErrored]: {
            target: States.expired,
            actions: [Actions.clearAuthToken],
          },
        },
      },
      [States.registerRetry]: {
        on: {
          [Events.registerSucceeded]: {
            target: States.success,
          },
          [Events.canceled]: {
            target: States.canceled,
          },
          [Events.statusPollingErrored]: {
            target: States.expired,
            actions: [Actions.clearAuthToken],
          },
        },
      },
      [States.canceled]: {
        type: 'final',
      },
      [States.unavailable]: {
        type: 'final',
      },
      [States.success]: {
        type: 'final',
      },
      [States.expired]: {
        on: {
          [Events.authTokenGotten]: {
            target: States.register,
            actions: [Actions.assignAuthToken],
          },
        },
      },
    },
  },
  {
    actions: {
      [Actions.assignDeviceInfo]: assign((context, event) => {
        if (event.type === Events.deviceInfoIdentified) {
          context.device = {
            type: event.payload.type,
            hasSupportForWebAuthn: event.payload.hasSupportForWebAuthn,
          };
        }
        return context;
      }),
      [Actions.assignAuthToken]: assign((context, event) => {
        if (event.type === Events.authTokenGotten) {
          context.authToken = event.payload.authToken;
        }
        return context;
      }),
      [Actions.clearAuthToken]: assign((context, event) => {
        if (event.type === Events.statusPollingErrored) {
          context.authToken = '';
        }
        return context;
      }),
    },
  },
);

export default d2pMobileMachine;
