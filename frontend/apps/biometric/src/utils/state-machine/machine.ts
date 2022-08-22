import { assign, createMachine } from 'xstate';

import {
  Actions,
  BiometricContext,
  BiometricEvent,
  Events,
  States,
} from './types';

export const createBiometricMachine = () =>
  createMachine<BiometricContext, BiometricEvent>(
    {
      predictableActionArguments: true,
      id: 'biometric',
      initial: States.init,
      context: {
        device: undefined,
        authToken: '',
      },
      states: {
        [States.init]: {
          on: {
            [Events.authTokenReceived]: [
              {
                description: 'If we are still waiting on device info to be set',
                actions: [Actions.assignAuthToken],
                cond: context => !context.device,
              },
              {
                description:
                  'If auth token is set, and device supports biometric',
                target: States.register,
                actions: [Actions.assignAuthToken],
                cond: (context, event) =>
                  !!event.payload.authToken &&
                  context.device?.type === 'mobile' &&
                  context.device?.hasSupportForWebauthn,
              },
              {
                description:
                  "If auth token is set, but device doesn't support biometrics",
                target: States.unavailable,
                actions: [Actions.assignAuthToken],
              },
            ],
            [Events.deviceInfoIdentified]: [
              {
                description:
                  'If auth token is set, and device supports biometric',
                target: States.register,
                cond: (context, event) =>
                  !!context.authToken &&
                  event.payload.type === 'mobile' &&
                  event.payload.hasSupportForWebauthn,
                actions: [Actions.assignDeviceInfo],
              },
              {
                description:
                  "If device is not mobile or doesn't support biometrics, no need to wait on auth token",
                target: States.unavailable,
                cond: (context, event) =>
                  event.payload.type !== 'mobile' ||
                  !event.payload.hasSupportForWebauthn,
                actions: [Actions.assignDeviceInfo],
              },
              {
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
            [Events.authTokenReceived]: {
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
              hasSupportForWebauthn: event.payload.hasSupportForWebauthn,
            };
          }
          return context;
        }),
        [Actions.assignAuthToken]: assign((context, event) => {
          if (event.type === Events.authTokenReceived) {
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

const biometricMachine = createBiometricMachine();

export default biometricMachine;
