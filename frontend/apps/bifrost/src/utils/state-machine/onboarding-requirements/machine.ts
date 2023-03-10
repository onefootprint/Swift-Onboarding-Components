import { DeviceInfo } from '@onefootprint/hooks';
import { OnboardingConfig } from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import { RequirementTargets, requiresAdditionalInfo } from './machine.utils';
import { MachineContext, MachineEvents, Requirements } from './types';

export type OnboardingRequirementsMachineArgs = {
  userFound: boolean;
  device: DeviceInfo;
  config: OnboardingConfig;
  authToken: string;
  email?: string;
};

const defaultRequirements: Requirements = {
  idDoc: false,
  liveness: false,
  kycData: [],
  identityCheck: false,
};

const createOnboardingRequirementsMachine = ({
  userFound,
  device,
  authToken,
  config,
  email,
}: OnboardingRequirementsMachineArgs) =>
  createMachine(
    {
      predictableActionArguments: true,
      id: 'onboarding-requirements',
      schema: {
        context: {} as MachineContext,
        events: {} as MachineEvents,
      },
      tsTypes: {} as import('./machine.typegen').Typegen0,
      initial: 'checkOnboardingRequirements',
      context: {
        onboardingContext: {
          userFound,
          device,
          authToken,
          config,
          email,
        },
        requirements: { ...defaultRequirements },
        kycData: {},
        startedDataCollection: false,
      },
      states: {
        checkOnboardingRequirements: {
          on: {
            onboardingRequirementsReceived: {
              target: 'router',
              actions: ['assignRequirements'],
            },
          },
        },
        router: {
          always: [
            {
              target: 'additionalInfoRequired',
              cond: context => requiresAdditionalInfo(context),
            },
            ...RequirementTargets,
            {
              target: 'success',
            },
          ],
        },
        additionalInfoRequired: {
          entry: ['startDataCollection'],
          on: {
            requirementCompleted: [
              ...RequirementTargets,
              {
                target: 'success',
              },
            ],
          },
        },
        kycData: {
          on: {
            requirementCompleted: {
              target: 'checkOnboardingRequirements',
            },
          },
        },
        transfer: {
          on: {
            requirementCompleted: {
              target: 'checkOnboardingRequirements',
            },
          },
        },
        idDoc: {
          on: {
            requirementCompleted: {
              target: 'checkOnboardingRequirements',
            },
          },
        },
        identityCheck: {
          on: {
            requirementCompleted: {
              target: 'checkOnboardingRequirements',
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
        assignRequirements: assign((context, event) => ({
          ...context,
          requirements: { ...event.payload },
        })),
        startDataCollection: assign(context => ({
          ...context,
          startedDataCollection: true,
        })),
      },
    },
  );

export default createOnboardingRequirementsMachine;
