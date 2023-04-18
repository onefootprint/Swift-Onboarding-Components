import { DeviceInfo } from '@onefootprint/hooks';
import { OnboardingConfig } from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import { MachineContext, MachineEvents } from './types';

export type OnboardingMachineArgs = {
  userFound: boolean;
  device: DeviceInfo;
  config: OnboardingConfig;
  authToken: string;
  email?: string;
  sandboxSuffix?: string; // only if in sandbox mode
};

const createOnboardingMachine = ({
  userFound,
  device,
  authToken,
  config,
  email,
  sandboxSuffix,
}: OnboardingMachineArgs) =>
  createMachine(
    {
      predictableActionArguments: true,
      id: 'onboarding',
      schema: {
        context: {} as MachineContext,
        events: {} as MachineEvents,
      },
      tsTypes: {} as import('./machine.typegen').Typegen0,
      initial: 'initOnboarding',
      context: {
        userFound,
        device,
        authToken,
        config,
        email,
        sandboxSuffix,
      },
      states: {
        initOnboarding: {
          on: {
            onboardingInitialized: [
              // TODO: Replace this with the one below. For now, for the demo, we are unconditionally
              // showing the authorize screen everytime the user signs-in even if they previously onboarded.
              // {
              //   target: 'success',
              //   cond: (context, event) => !!event.payload.validationToken,
              //   actions: ['assignValidationToken'],
              // },
              {
                target: 'authorize',
                cond: (context, event) => !!event.payload.validationToken,
                actions: ['assignValidationToken'],
              },
              {
                target: 'onboardingRequirements',
              },
            ],
          },
        },
        onboardingRequirements: {
          on: {
            onboardingRequirementsCompleted: {
              target: 'authorize',
            },
          },
        },
        authorize: {
          on: {
            authorized: {
              target: 'success',
              actions: ['assignValidationToken'],
            },
          },
        },
        success: {
          type: 'final',
        },
      },
    },
    {
      actions: {
        assignValidationToken: assign((context, event) => ({
          ...context,
          validationToken: event.payload.validationToken,
        })),
      },
    },
  );

export default createOnboardingMachine;
