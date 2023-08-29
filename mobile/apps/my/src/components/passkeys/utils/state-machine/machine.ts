import { createMachine } from 'xstate';

import { MachineEvents } from './types';

export const createPasskeysMachine = () =>
  createMachine({
    predictableActionArguments: true,
    id: 'passkeys',
    schema: {
      events: {} as MachineEvents,
    },
    tsTypes: {} as import('./machine.typegen').Typegen0,
    initial: 'register',
    context: {},
    states: {
      register: {
        on: {
          failed: {
            target: 'retry',
          },
          completed: {
            target: 'completed',
          },
        },
      },
      retry: {
        on: {
          skipped: {
            target: 'completed',
          },
          completed: {
            target: 'completed',
          },
        },
      },
      completed: {
        type: 'final',
      },
    },
  });

export default createPasskeysMachine;
