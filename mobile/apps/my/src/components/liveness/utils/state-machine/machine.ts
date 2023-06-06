import { createMachine } from 'xstate';

import { MachineEvents } from './types';

export const createLivenessMachine = () =>
  createMachine({
    predictableActionArguments: true,
    id: 'liveness',
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

const livenessMachine = createLivenessMachine();

export default livenessMachine;
