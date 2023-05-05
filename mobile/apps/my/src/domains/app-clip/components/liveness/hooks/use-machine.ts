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
      tsTypes: {} as import('./use-machine.typegen').Typegen0,
      initial: 'init',
      context: {},
      on: {
        reset: {
          target: 'init',
          actions: ['resetContext'],
        },
        statusReceived: [
          {
            target: 'expired',
            cond: (context, event) => !!event.payload.isError,
          },
          {
            target: 'canceled',
            cond: (context, event) =>
              event.payload.status === D2PStatus.canceled,
          },
          {
            target: 'completed',
            cond: (context, event) =>
              event.payload.status === D2PStatus.completed ||
              event.payload.status === D2PStatus.failed,
          },
        ],
      },
      states: {
        init: {
          on: {
            started: [
              {
                actions: ['assignAuthToken'],
                target: 'liveness',
              },
            ],
            failed: [
              {
                target: 'error',
              },
            ],
            completed: [
              {
                target: 'completed',
              },
            ],
          },
        },
        liveness: {
          on: {
            failed: {
              target: 'retry',
            },
            requirementCompleted: {
              target: 'completed',
            },
          },
        },
        retry: {
          on: {
            skipped: {
              target: 'completed',
            },
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
        assignAuthToken: assign((context, event) => {
          context.authToken = event.payload.authToken;
          return context;
        }),
        resetContext: assign(() => ({})),
      },
    },
  );

const handoffMachine = createHandoffMachine();

export default handoffMachine;
