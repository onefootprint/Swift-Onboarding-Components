import { assign, createMachine } from 'xstate';

import type { MachineContext, MachineEvents } from './types';
import { OnboardingTemplate, PlaybookKind } from './types';

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
      initial: 'kind',
      context: {
        kind: PlaybookKind.Unknown,
      },
      states: {
        kind: {
          on: {
            kindSubmitted: [
              {
                target: 'onboardingTemplates',
                actions: ['assignKind'],
                cond: (_, event) => event.payload.kind === PlaybookKind.Kyc,
              },
              {
                target: 'nameYourPlaybook',
                actions: ['assignKind'],
              },
            ],
          },
        },
        onboardingTemplates: {
          on: {
            onboardingTemplatesSelected: [
              {
                target: 'residency',
                actions: ['assignOnboardingTemplate'],
                cond: (_, event) => event.payload.onboardingTemplate === OnboardingTemplate.Custom,
              },
              {
                target: 'nameYourPlaybook',
                actions: ['assignOnboardingTemplate'],
              },
            ],
            navigationBackward: {
              target: 'kind',
              actions: ['resetKind'],
            },
          },
        },
        residency: {
          on: {
            kindSelected: {
              target: 'kind',
              actions: ['resetKind', 'resetOnboardingTemplate'],
            },
            templateSelected: {
              target: 'onboardingTemplates',
              actions: ['resetOnboardingTemplate'],
            },
            residencySubmitted: {
              target: 'nameYourPlaybook',
              actions: ['assignResidency'],
            },
            navigationBackward: {
              target: 'onboardingTemplates',
              actions: ['resetOnboardingTemplate'],
            },
          },
        },
        nameYourPlaybook: {
          on: {
            kindSelected: {
              target: 'kind',
              actions: ['resetKind', 'resetOnboardingTemplate'],
            },
            navigationBackward: [
              {
                target: 'residency',
                cond: context =>
                  context.kind === PlaybookKind.Kyc && context.onboardingTemplate === OnboardingTemplate.Custom,
              },
              {
                target: 'onboardingTemplates',
                actions: ['resetOnboardingTemplate'],
                cond: context => context.kind === PlaybookKind.Kyc,
              },
              {
                target: 'kind',
              },
            ],
            nameYourPlaybookSubmitted: [
              {
                target: 'settingsKyc',
                actions: ['assignNameYourPlaybook'],
                cond: context => context.kind === PlaybookKind.Kyc,
              },
              {
                target: 'settingsKyb',
                actions: ['assignNameYourPlaybook'],
                cond: context => context.kind === PlaybookKind.Kyb,
              },
              {
                target: 'settingsAuth',
                actions: ['assignNameYourPlaybook'],
                cond: context => context.kind === PlaybookKind.Auth,
              },
              {
                target: 'settingsDocOnly',
                actions: ['assignNameYourPlaybook'],
                cond: context => context.kind === PlaybookKind.DocOnly,
              },
            ],
          },
        },
        settingsKyc: {
          initial: 'personalInfo',
          states: {
            personalInfo: {
              on: {
                kindSelected: {
                  target: '#playbooks.kind',
                  actions: ['resetKind', 'resetOnboardingTemplate'],
                },
                nameYourPlaybookSelected: {
                  target: '#playbooks.nameYourPlaybook',
                },
                playbookSubmitted: {
                  target: 'otpVerifications',
                  actions: 'assignPlaybook',
                },
                navigationBackward: {
                  target: '#playbooks.nameYourPlaybook',
                },
              },
            },
            otpVerifications: {
              on: {
                kindSelected: {
                  target: '#playbooks.kind',
                  actions: ['resetKind', 'resetOnboardingTemplate'],
                },
                nameYourPlaybookSelected: {
                  target: '#playbooks.nameYourPlaybook',
                },
                playbookSubmitted: {
                  target: '#playbooks.verificationChecks',
                  actions: 'assignPlaybook',
                },
                navigationBackward: {
                  target: 'personalInfo',
                },
              },
            },
          },
        },
        settingsKyb: {
          initial: 'settingsBusiness',
          states: {
            settingsBusiness: {
              on: {
                playbookSubmitted: {
                  target: 'settingsBo',
                  actions: 'assignPlaybook',
                },
                navigationBackward: {
                  target: '#playbooks.nameYourPlaybook',
                },
                kindSelected: {
                  target: '#playbooks.kind',
                  actions: ['resetKind', 'resetOnboardingTemplate'],
                },
                nameYourPlaybookSelected: {
                  target: '#playbooks.nameYourPlaybook',
                },
              },
            },
            settingsBo: {
              on: {
                playbookSubmitted: {
                  target: 'otpVerifications',
                  actions: 'assignPlaybook',
                },
                navigationBackward: {
                  target: 'settingsBusiness',
                },
                kindSelected: {
                  target: '#playbooks.kind',
                  actions: ['resetKind', 'resetOnboardingTemplate'],
                },
                nameYourPlaybookSelected: {
                  target: '#playbooks.nameYourPlaybook',
                },
              },
            },
            otpVerifications: {
              on: {
                kindSelected: {
                  target: '#playbooks.kind',
                  actions: ['resetKind', 'resetOnboardingTemplate'],
                },
                nameYourPlaybookSelected: {
                  target: '#playbooks.nameYourPlaybook',
                },
                playbookSubmitted: {
                  target: '#playbooks.verificationChecks',
                  actions: 'assignPlaybook',
                },
                navigationBackward: {
                  target: 'settingsBo',
                },
              },
            },
          },
        },
        settingsAuth: {
          on: {
            kindSelected: {
              target: 'kind',
              actions: ['resetKind', 'resetOnboardingTemplate'],
            },
            nameYourPlaybookSelected: {
              target: 'nameYourPlaybook',
            },
            navigationBackward: {
              target: 'nameYourPlaybook',
            },
          },
        },
        settingsDocOnly: {
          on: {
            kindSelected: {
              target: 'kind',
              actions: ['resetKind', 'resetOnboardingTemplate'],
            },
            nameYourPlaybookSelected: {
              target: 'nameYourPlaybook',
            },
            navigationBackward: {
              target: 'nameYourPlaybook',
            },
          },
        },
        verificationChecks: {
          on: {
            kindSelected: {
              target: 'kind',
              actions: ['resetKind', 'resetOnboardingTemplate'],
            },
            nameYourPlaybookSelected: {
              target: 'nameYourPlaybook',
            },
            settingsKycSelected: {
              target: 'settingsKyc',
            },
            navigationBackward: [
              {
                target: 'settingsKyb.otpVerifications',
                cond: context => context.kind === PlaybookKind.Kyb,
              },
              {
                target: 'settingsKyc.otpVerifications',
                cond: context => context.kind === PlaybookKind.Kyc,
              },
            ],
            verificationChecksSubmitted: {
              actions: 'assignVerificationChecks',
            },
          },
        },
      },
    },
    {
      actions: {
        assignKind: assign((context, event) => ({
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
        assignVerificationChecks: assign((context, event) => ({
          ...context,
          verificationChecksForm: event.payload.formData,
        })),
        assignOnboardingTemplate: assign((context, event) => {
          const template = event.payload.onboardingTemplate;
          if (template === OnboardingTemplate.Custom) {
            return {
              ...context,
              onboardingTemplate: template,
            };
          }
          return {
            ...context,
            onboardingTemplate: template,
            residencyForm: undefined,
            nameForm: undefined,
            playbook: undefined,
            verificationChecksForm: undefined,
          };
        }),
        resetOnboardingTemplate: assign(context => ({
          ...context,
          onboardingTemplate: undefined,
        })),
      },
    },
  );

const PlaybookMachine = createPlaybookMachine();

export default PlaybookMachine;
