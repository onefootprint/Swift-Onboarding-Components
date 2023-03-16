import { assign, createMachine } from 'xstate';

import { MachineContext, MachineEvents } from './types';

export const createOnboardingConfigMachine = () =>
  createMachine(
    {
      predictableActionArguments: true,
      id: 'onboarding-config',
      schema: {
        context: {} as MachineContext,
        events: {} as MachineEvents,
      },
      tsTypes: {} as import('./machine.typegen').Typegen0,
      initial: 'type',
      context: {},
      states: {
        type: {
          on: {
            typeSubmitted: {
              target: 'name',
              actions: ['assignType'],
            },
          },
        },
        name: {
          on: {
            nameSubmitted: [
              {
                target: 'kybCollect',
                cond: context => context.type === 'kyb',
                actions: ['assignName'],
              },
              {
                target: 'kycCollect',
                actions: ['assignName'],
              },
            ],
            prevClicked: {
              target: 'type',
            },
          },
        },
        kycCollect: {
          on: {
            kycCollectSubmitted: {
              target: 'kycAccess',
              actions: ['assignKycCollect'],
            },
            prevClicked: {
              target: 'name',
            },
          },
        },
        kycAccess: {
          on: {
            kycAccessSubmitted: {
              target: 'kybCollect',
              actions: ['assignKycAccess'],
            },
            prevClicked: {
              target: 'kycCollect',
            },
          },
        },
        kybCollect: {
          on: {
            kybCollectSubmitted: {
              target: 'kybBoCollect',
              actions: ['assignKybCollect'],
            },
            prevClicked: {
              target: 'name',
            },
          },
        },
        kybBoCollect: {
          on: {
            kycCollectSubmitted: {
              target: 'kybAccess',
              actions: ['assignKycCollect'],
            },
            prevClicked: {
              target: 'kybCollect',
            },
          },
        },
        kybAccess: {
          on: {
            kybAccessSubmitted: {
              target: 'kybBoCollect',
              actions: ['assignKybAccess'],
            },
            prevClicked: {
              target: 'kybBoCollect',
            },
          },
        },
      },
    },
    {
      actions: {
        assignName: assign((context, event) => ({
          ...context,
          name: event.payload.name,
        })),
        assignType: assign((context, event) => ({
          ...context,
          type: event.payload.type,
        })),
        assignKycCollect: assign((context, event) => ({
          ...context,
          kycCollect: event.payload,
        })),
        assignKycAccess: assign((context, event) => ({
          ...context,
          kycAccess: event.payload,
        })),
        assignKybCollect: assign((context, event) => ({
          ...context,
          kybCollect: event.payload,
        })),
        assignKybAccess: assign((context, event) => ({
          ...context,
          kybAccess: event.payload,
        })),
      },
    },
  );

const OnboardingConfigMachine = createOnboardingConfigMachine();

export default OnboardingConfigMachine;
