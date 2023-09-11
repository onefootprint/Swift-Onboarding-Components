import { assign, createMachine } from 'xstate';

import type { Typegen0 } from './machine.typegen';
import type { MachineContext, MachineEvents } from './types';
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
      tsTypes: {} as Typegen0,
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
        },
      },
    },
    {
      actions: {
        assignInitContext: assign((context, event) => {
          const { config, bootstrapData, showCompletionPage, showLogo } =
            event.payload;
          context.config = config !== undefined ? config : context.config;
          context.bootstrapData =
            bootstrapData !== undefined ? bootstrapData : context.bootstrapData;
          context.showCompletionPage =
            showCompletionPage !== undefined
              ? showCompletionPage
              : context.showCompletionPage;
          context.showLogo =
            showLogo !== undefined ? showLogo : context.showLogo;
          return context;
        }),
        resetContext: assign(() => ({})),
      },
    },
  );

const BifrostMachine = createBifrostMachine();

export default BifrostMachine;
