import { createMachine } from 'xstate';

import { MachineContext, MachineEvents } from './types';

const createCollectKybDataMachine = () =>
  createMachine(
    {
      predictableActionArguments: true,
      id: 'investor-profile',
      schema: {
        context: {} as MachineContext,
        events: {} as MachineEvents,
      },
      tsTypes: {} as import('./machine.typegen').Typegen0,
      initial: 'init',
      context: {},
      states: {
        init: {},
        completed: {
          type: 'final',
        },
      },
    },
    {
      actions: {},
    },
  );

export default createCollectKybDataMachine;
