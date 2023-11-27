import { CLIENT_PUBLIC_KEY_HEADER } from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import type { MachineContext, MachineEvents } from './types';

export const createPasskeysMachine = (authToken: string) =>
  createMachine(
    {
      predictableActionArguments: true,
      id: 'verify',
      schema: {
        context: {} as MachineContext,
        events: {} as MachineEvents,
      },
      // eslint-disable-next-line @typescript-eslint/consistent-type-imports
      tsTypes: {} as import('./machine.typegen').Typegen0,
      initial: 'init',
      context: {
        authToken,
      },
      states: {
        init: {
          on: {
            sdkArgsReceived: {
              target: 'emailIdentification',
              actions: ['assignConfig', 'assignObConfigAuth'],
            },
            failed: {
              target: 'initFailed',
            },
          },
        },
        initFailed: {
          type: 'final',
        },
        emailIdentification: {
          on: {
            identified: [
              // TODO: biometric and email challenge
              {
                target: 'phoneIdentification',
                actions: ['assignIdentifyResult'],
                cond: (context, event) =>
                  !event.payload.userFound ||
                  !event.payload.availableChallengeKinds ||
                  event.payload.availableChallengeKinds.length === 0,
              },
              {
                target: 'smsChallenge',
                actions: ['assignIdentifyResult'],
              },
            ],
          },
        },
        phoneIdentification: {
          on: {
            identified: {
              target: 'smsChallenge',
              actions: ['assignIdentifyResult'],
            },
            identifyReset: {
              target: 'emailIdentification',
              actions: ['reset'],
            },
          },
        },
        smsChallenge: {
          on: {
            done: 'basicInformation',
          },
        },
        basicInformation: {
          on: {
            done: 'residentialAddress',
          },
        },
        residentialAddress: {
          on: {
            done: 'ssn',
          },
        },
        ssn: {
          on: {
            done: 'completed',
          },
        },

        completed: {
          type: 'final',
        },
      },
    },
    {
      actions: {
        assignConfig: assign((context, event) => {
          context.config = event.payload.config;
          return context;
        }),
        assignObConfigAuth: assign((context, event) => {
          context.obConfigAuth = {
            [CLIENT_PUBLIC_KEY_HEADER]: event.payload.config.key,
          };
          return context;
        }),
        assignIdentifyResult: assign((context, event) => {
          if (!context.identify) {
            context.identify = event.payload;
            return;
          }
          context.identify.email =
            context.identify?.email || event.payload.email;
          context.identify.phoneNumber =
            context.identify?.phoneNumber || event.payload.phoneNumber;
          context.identify.userFound = event.payload.userFound;
          context.identify.isUnverified = event.payload.isUnverified;
          context.identify.availableChallengeKinds =
            event.payload.availableChallengeKinds;
          context.identify.hasSyncablePassKey =
            event.payload.hasSyncablePassKey;
          return context;
        }),
        reset: assign(context => {
          context.identify = undefined;
          return context;
        }),
      },
    },
  );

export default createPasskeysMachine;
