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
          // TODO:
        },
        kycAccess: {
          // TODO:
        },
        kybCollect: {
          // TODO:
        },
        kybAccess: {
          // TODO:
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
      },
    },
  );

const OnboardingConfigMachine = createOnboardingConfigMachine();

export default OnboardingConfigMachine;
