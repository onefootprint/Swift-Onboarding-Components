import { assign, createMachine } from 'xstate';

import type { MachineContext, MachineEvents } from './types';
import { PlaybookKind } from './types';

export const createPlaybookMachine = () =>
  createMachine(
    {
      predictableActionArguments: true,
      id: 'playbooks',
      schema: {
        context: {} as MachineContext,
        events: {} as MachineEvents,
      },
      // eslint-disable-next-line
      tsTypes: {} as import('./machine.typegen').Typegen0,
      initial: 'whoToOnboard',
      context: {
        kind: PlaybookKind.Unknown,
      },
      states: {
        whoToOnboard: {
          on: {
            whoToOnboardSubmitted: [
              {
                target: 'residency',
                actions: ['assignWhoToOnboard'],
                cond: (_, event) => event.payload.kind === PlaybookKind.Kyc,
              },
              {
                target: 'nameYourPlaybook',
                actions: ['assignWhoToOnboard'],
              },
            ],
          },
        },
        residency: {
          on: {
            residencySubmitted: {
              target: 'nameYourPlaybook',
              actions: ['assignResidency'],
            },
            navigationBackward: {
              target: 'whoToOnboard',
              actions: ['resetKind'],
            },
          },
        },
        nameYourPlaybook: {
          on: {
            navigationBackward: [
              {
                target: 'residency',
                cond: context => context.kind === PlaybookKind.Kyc,
              },
              {
                target: 'whoToOnboard',
                actions: ['resetKind'],
              },
            ],
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
            navigationBackward: {
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
            navigationBackward: {
              target: 'yourPlaybook',
            },
          },
        },
      },
    },
    {
      actions: {
        resetKind: assign(context => ({
          ...context,
          kind: PlaybookKind.Unknown,
        })),
        assignWhoToOnboard: assign((context, event) => ({
          ...context,
          kind: event.payload.kind,
        })),
        assignNameYourPlaybook: assign((context, event) => ({
          ...context,
          nameForm: event.payload.formData,
        })),
        assignResidency: assign((context, event) => ({
          ...context,
          residencyForm: event.payload.formData,
        })),
        assignPlaybook: assign((context, event) => ({
          ...context,
          playbook: event.payload.formData,
        })),
      },
    },
  );

const PlaybookMachine = createPlaybookMachine();

export default PlaybookMachine;
