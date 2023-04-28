import { assign, createMachine } from 'xstate';

import { MachineContext, MachineEvents } from './types';
import isContextReady from './utils/is-context-ready';

export const createBifrostMachine = () =>
  createMachine(
    {
      predictableActionArguments: true,
      id: 'bifrost',
      schema: {
        context: {} as MachineContext,
        events: {} as MachineEvents,
      },
      tsTypes: {} as import('./machine.typegen').Typegen0,
      initial: 'init',
      context: {},
      on: {
        reset: {
          target: 'init',
          actions: ['resetContext'],
        },
      },
      states: {
        init: {
          on: {
            configRequestFailed: {
              target: 'idv',
            },
            initContextUpdated: [
              {
                target: 'idv',
                actions: ['assignInitContext'],
                cond: (context, event) => isContextReady(context, event),
              },
              {
                actions: ['assignInitContext'],
              },
            ],
          },
        },
        idv: {
          type: 'final',
          on: {
            idvCompleted: {
              actions: ['assignValidationToken'],
            },
          },
        },
      },
    },
    {
      actions: {
        assignInitContext: assign((context, event) => {
          const { config, bootstrapData } = event.payload;
          context.config = config !== undefined ? config : context.config;
          context.bootstrapData =
            bootstrapData !== undefined ? bootstrapData : context.bootstrapData;
          return context;
        }),
        assignValidationToken: assign((context, event) => {
          const { validationToken } = event.payload;
          context.validationToken = validationToken;
          return context;
        }),
        resetContext: assign(() => ({})),
      },
    },
  );

const BifrostMachine = createBifrostMachine();

export default BifrostMachine;
