import { assign, createMachine } from 'xstate';

import type { Typegen0 } from './machine.typegen';
import type { MachineContext, MachineEvents } from './types';

export const createPlaybookMachine = () =>
  createMachine(
    {
      predictableActionArguments: true,
      id: 'playbooks',
      schema: {
        context: {} as MachineContext,
        events: {} as MachineEvents,
      },
      tsTypes: {} as Typegen0,
      initial: 'whoToOnboard',
      context: {},
      states: {
        whoToOnboard: {
          on: {
            whoToOnboardSubmitted: {
              target: 'nameYourPlaybook',
              actions: ['assignWhoToOnboard'],
            },
          },
        },
        nameYourPlaybook: {
          on: {
            whoToOnboardSelected: {
              target: 'whoToOnboard',
            },
            nameYourPlaybookSubmitted: {
              target: 'yourPlaybook',
              actions: ['assignNameYourPlaybook'],
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
          nameForm: event.payload.nameForm,
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
