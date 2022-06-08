import { assign, createMachine } from 'xstate';

import { Actions, D2PContext, D2PEvent, Events, States } from './types';

const initialContext: D2PContext = {
  device: {
    type: 'mobile',
    hasSupportForWebAuthn: false,
  },
  authToken: 'PLACEHOLDER_AUTH_TOKEN', // TODO: fill this later
};

const d2pMachine = createMachine<D2PContext, D2PEvent>(
  {
    id: 'd2pMachine',
    initial: States.init,
    context: initialContext,
    on: {
      [Events.deviceInfoIdentified]: {
        actions: [Actions.assignDeviceInfo],
      },
    },
    states: {
      [States.init]: {
        always: [
          {
            target: States.biometricRegister,
            cond: context =>
              context.device.type === 'mobile' &&
              context.device.hasSupportForWebAuthn,
          },
          {
            target: States.biometricUnavailable,
          },
        ],
      },
      [States.biometricRegister]: {
        on: {
          [Events.biometricRegisterFailed]: {
            target: States.biometricRegisterRetry,
          },
          [Events.biometricRegisterSucceeded]: {
            target: States.biometricSuccess,
          },
        },
      },
      [States.biometricRegisterRetry]: {
        on: {
          [Events.biometricRegisterSucceeded]: {
            target: States.biometricSuccess,
          },
        },
      },
      [States.biometricUnavailable]: {
        type: 'final',
      },
      [States.biometricSuccess]: {
        type: 'final',
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
    },
  },
);

export default d2pMachine;
