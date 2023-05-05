import { D2PStatus } from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import { MachineContext, MachineEvents } from './types';

export const createHandoffMachine = () =>
  createMachine(
    {
      predictableActionArguments: true,
      id: 'handoff',
      schema: {
        context: {} as MachineContext,
        events: {} as MachineEvents,
      },
      tsTypes: {} as import('./machine.typegen').Typegen0,
      initial: 'init',
      context: {},
      on: {
        authTokenChanged: {
          target: 'init',
          actions: ['assignAuthToken'],
        },
        authTokenFailed: {
          target: 'error',
        },
        statusReceived: [
          {
            target: 'expired',
            cond: (_, event) => !!event.payload.isError,
          },
          {
            target: 'canceled',
            cond: (_, event) => event.payload.status === D2PStatus.canceled,
          },
          {
            target: 'completed',
            cond: (_, event) =>
              event.payload.status === D2PStatus.completed ||
              event.payload.status === D2PStatus.failed,
          },
        ],
      },
      states: {
        init: {
          on: {
            initCompleted: {
              target: 'liveness',
            },
            initFailed: {
              target: 'error',
            },
          },
        },
        liveness: {
          on: {
            requirementCompleted: {
              target: 'completed',
            },
          },
        },
        error: {
          type: 'final',
        },
        expired: {
          type: 'final',
        },
        canceled: {
          type: 'final',
        },
        completed: {
          type: 'final',
        },
      },
    },
    {
      actions: {
        assignAuthToken: assign((_, event) => {
          return {
            authToken: event.payload.authToken,
          };
        }),
      },
    },
  );

const handoffMachine = createHandoffMachine();

export default handoffMachine;
