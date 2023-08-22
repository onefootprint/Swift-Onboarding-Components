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
      initial: 'nameYourPlaybook',
      context: {},
      states: {
        nameYourPlaybook: {
          on: {
            nameYourPlaybookSubmitted: {
              target: 'whoToOnboard',
              actions: ['assignNameYourPlaybook'],
            },
          },
        },
        whoToOnboard: {
          on: {
            whoToOnboardSubmitted: {
              target: 'yourPlaybook',
              actions: ['assignWhoToOnboard'],
            },
            nameYourPlaybookSelected: {
              target: 'nameYourPlaybook',
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
            nameYourPlaybookSelected: {
              target: 'nameYourPlaybook',
            },
          },
        },
        authorizedScopes: {
          on: {
            whoToOnboardSelected: {
              target: 'whoToOnboard',
            },
            yourPlaybookSelected: {
              target: 'yourPlaybook',
            },
            nameYourPlaybookSelected: {
              target: 'nameYourPlaybook',
            },
          },
        },
      },
    },
    {
      actions: {
        assignNameYourPlaybook: assign((context, event) => ({
          ...context,
          name: event.payload.name,
        })),
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
