import { assign, createMachine } from 'xstate';

import { MachineContext, MachineEvents } from './types';

export const createPlaybookMachine = () =>
  createMachine(
    {
      predictableActionArguments: true,
      id: 'playbooks',
      schema: {
        context: {} as MachineContext,
        events: {} as MachineEvents,
      },
      tsTypes: {} as import('./machine.typegen').Typegen0,
      initial: 'whoToOnboard',
      context: {},
      states: {
        whoToOnboard: {
          on: {
            whoToOnboardSubmitted: {
              target: 'yourPlaybook',
              actions: ['assignWhoToOnboard'],
            },
          },
        },
        yourPlaybook: {
          on: {
            whoToOnboardSelected: {
              target: 'whoToOnboard',
            },
            playbookSubmitted: {
              target: 'authorizedScopes',
              actions: 'assignPlaybook',
            },
          },
        },
        authorizedScopes: {},
      },
    },
    {
      actions: {
        assignWhoToOnboard: assign((context, event) => ({
          ...context,
          kind: event.payload.kind,
        })),
        assignPlaybook: assign((context, event) => ({
          ...context,
          playbook: event.payload.playbook,
        })),
      },
    },
  );

const PlaybookMachine = createPlaybookMachine();

export default PlaybookMachine;
