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
  sandboxSuffix?: string; // only if in sandbox mode
};

const defaultRequirements: Requirements = {
  idDoc: false,
  liveness: false,
  kybData: [],
  kycData: [],
  investorProfile: [],
};

const createOnboardingRequirementsMachine = ({
  userFound,
  device,
  authToken,
  config,
  email,
  sandboxSuffix,
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
          sandboxSuffix,
        },
        requirements: { ...defaultRequirements },
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
        kybData: {
          on: {
            requirementCompleted: {
              target: 'checkOnboardingRequirements',
            },
          },
        },
        investorProfile: {
          on: {
            requirementCompleted: {
              target: 'checkOnboardingRequirements',
            },
          },
        },
        kycData: {
          exit: ['markCollectedKycData'],
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
        markCollectedKycData: assign(context => ({
          ...context,
          collectedKycData: true,
        })),
      },
    },
  );

export default createOnboardingRequirementsMachine;
