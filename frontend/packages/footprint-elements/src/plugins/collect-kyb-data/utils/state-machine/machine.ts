import { assign, createMachine } from 'xstate';

import { MachineContext, MachineEvents } from './types';

const createCollectKybDataMachine = () =>
  createMachine(
    {
      predictableActionArguments: true,
      id: 'collect-kyb-data',
      schema: {
        context: {} as MachineContext,
        events: {} as MachineEvents,
      },
      tsTypes: {} as import('./machine.typegen').Typegen0,
      initial: 'init',
      context: {},
      states: {
        init: {
          on: {
            receivedContext: {
              actions: 'assignInitialContext',
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
        assignInitialContext: assign((context, event) => {
          const { authToken, device, config } = event.payload;
          context.device = device;
          context.authToken = authToken;
          context.config = config;
          return context;
        }),
      },
    },
  );

export default createCollectKybDataMachine;
