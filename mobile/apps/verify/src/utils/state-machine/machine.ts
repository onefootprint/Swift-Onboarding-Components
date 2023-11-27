import { assign } from 'lodash';
import { createMachine } from 'xstate';

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
              actions: ['assignConfig'],
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
            done: 'phoneIdentification',
          },
        },
        phoneIdentification: {
          on: {
            done: 'smsChallenge',
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
      },
    },
  );

export default createPasskeysMachine;
