import { assign, createMachine } from 'xstate';

import type { Typegen0 } from './machine.typegen';
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
      tsTypes: {} as Typegen0,
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
                    device: { type, hasSupportForWebauthn },
                  } = event.payload;
                  return type === 'mobile' && !!hasSupportForWebauthn;
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
          authToken: event.payload.authToken,
          device: event.payload.device,
        })),
      },
    },
  );

const LivenessMachine = createLivenessMachine();

export default LivenessMachine;
