import { createMachine } from 'xstate';

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
          // TODO:
        },
        name: {
          // TODO:
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
        // TODO:
      },
    },
  );

const OnboardingConfigMachine = createOnboardingConfigMachine();

export default OnboardingConfigMachine;
