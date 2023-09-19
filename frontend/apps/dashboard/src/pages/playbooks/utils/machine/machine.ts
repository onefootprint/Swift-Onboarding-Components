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
            whoToOnboardSelected: {
              target: 'whoToOnboard',
              actions: ['resetKind'],
            },
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
            whoToOnboardSelected: {
              target: 'whoToOnboard',
              actions: ['resetKind'],
            },
            navigationBackward: [
              {
                target: 'residency',
                cond: context => context.kind === PlaybookKind.Kyc,
              },
              {
                target: 'whoToOnboard',
              },
            ],
            nameYourPlaybookSubmitted: {
              target: 'summary',
              actions: ['assignNameYourPlaybook'],
            },
          },
        },
        summary: {
          on: {
            whoToOnboardSelected: {
              target: 'whoToOnboard',
              actions: ['resetKind'],
            },
            nameYourPlaybookSelected: {
              target: 'nameYourPlaybook',
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
              actions: ['resetKind'],
            },
            nameYourPlaybookSelected: {
              target: 'nameYourPlaybook',
            },
            summarySelected: {
              target: 'summary',
            },
            navigationBackward: {
              target: 'summary',
            },
            authorizedScopesSubmitted: {
              target: 'aml',
              actions: 'assignAuthorizedScopes',
            },
          },
        },
        aml: {
          on: {
            whoToOnboardSelected: {
              target: 'whoToOnboard',
              actions: ['resetKind'],
            },
            nameYourPlaybookSelected: {
              target: 'nameYourPlaybook',
            },
            summarySelected: {
              target: 'summary',
            },
            authorizedScopesSelected: {
              target: 'authorizedScopes',
            },
            navigationBackward: {
              target: 'authorizedScopes',
            },
            amlSubmitted: {
              actions: 'assignAml',
            },
          },
        },
      },
    },
    {
      actions: {
        assignWhoToOnboard: assign((context, event) => ({
          ...context,
          kind: event.payload.kind,
        })),
        resetKind: assign(context => ({
          ...context,
          kind: PlaybookKind.Unknown,
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
        assignAuthorizedScopes: assign((context, event) => ({
          ...context,
          authorizedScopesForm: event.payload.formData,
        })),
        assignAml: assign((context, event) => ({
          ...context,
          amlForm: event.payload.formData,
        })),
      },
    },
  );

const PlaybookMachine = createPlaybookMachine();

export default PlaybookMachine;
