import { assign, createMachine } from 'xstate';

import type { MachineContext, MachineEvents } from './types';

export const createLivenessMachine = () =>
  createMachine(
    {
      predictableActionArguments: true,
      id: 'liveness',
      schema: {
        context: {} as MachineContext,
        events: {} as MachineEvents,
      },
      // eslint-disable-next-line @typescript-eslint/consistent-type-imports
      tsTypes: {} as import('./machine.typegen').Typegen0,
      initial: 'init',
      context: {},
      states: {
        init: {
          on: {
            receivedContext: [
              {
                target: 'register',
                actions: 'assignContext',
                cond: (context, event) => {
                  const {
                    isTransfer,
                    device: { type, hasSupportForWebauthn },
                  } = event.payload;
                  return (
                    !!isTransfer && type === 'mobile' && !!hasSupportForWebauthn
                  );
                },
              },
              {
                target: 'unavailable',
                actions: 'assignContext',
              },
            ],
          },
        },
        register: {
          on: {
            failed: {
              target: 'retry',
            },
            succeeded: {
              target: 'completed',
            },
          },
        },
        retry: {
          on: {
            failed: {
              target: 'retry',
            },
            skipped: {
              target: 'completed',
            },
            succeeded: {
              target: 'completed',
            },
          },
        },
        unavailable: {
          on: {
            completed: {
              target: 'completed',
            },
          },
        },
        completed: {
          type: 'final',
        },
      },
    },
    {
      actions: {
        assignContext: assign((context, event) => ({
          ...context,
          isTransfer: event.payload.isTransfer,
          authToken: event.payload.authToken,
          device: event.payload.device,
        })),
      },
    },
  );

const LivenessMachine = createLivenessMachine();

export default LivenessMachine;
