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
          [Events.authTokenIdentified]: {
            actions: [Actions.assignAuthToken],
          },
          [Events.deviceInfoIdentified]: [
            {
              target: States.biometricRegister,
              cond: (context, event) =>
                event.payload.type === 'mobile' &&
                event.payload.hasSupportForWebAuthn,
              actions: [Actions.assignDeviceInfo],
            },
            {
              target: States.biometricUnavailable,
              actions: [Actions.assignDeviceInfo],
            },
          ],
        },
      },
      [States.biometricRegister]: {
        on: {
          [Events.biometricRegisterFailed]: {
            target: States.biometricRegisterRetry,
          },
          [Events.biometricRegisterSucceeded]: {
            target: States.biometricSuccess,
          },
          [Events.biometricCanceled]: {
            target: States.biometricCanceled,
          },
        },
      },
      [States.biometricRegisterRetry]: {
        on: {
          [Events.biometricRegisterSucceeded]: {
            target: States.biometricSuccess,
          },
          [Events.biometricCanceled]: {
            target: States.biometricCanceled,
          },
        },
      },
      [States.biometricCanceled]: {
        type: 'final',
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
      [Actions.assignAuthToken]: assign((context, event) => {
        if (event.type === Events.authTokenIdentified) {
          context.authToken = event.payload.authToken;
        }
        return context;
      }),
    },
  },
);

export default d2pMobileMachine;
