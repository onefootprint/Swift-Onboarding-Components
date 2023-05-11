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
  phoneNumber?: string;
  sandboxSuffix?: string; // only if in sandbox mode
  isTransfer?: boolean;
};

const defaultRequirements: Requirements = {};

const createOnboardingRequirementsMachine = ({
  userFound,
  device,
  authToken,
  config,
  email,
  phoneNumber,
  sandboxSuffix,
  isTransfer,
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
      initial: 'checkRequirements',
      context: {
        onboardingContext: {
          userFound,
          device,
          authToken,
          config,
          email,
          phoneNumber,
          sandboxSuffix,
          isTransfer,
        },
        requirements: { ...defaultRequirements },
        startedDataCollection: false,
      },
      states: {
        checkRequirements: {
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
              target: 'checkRequirements',
            },
          },
        },
        investorProfile: {
          on: {
            requirementCompleted: {
              target: 'checkRequirements',
            },
          },
        },
        kycData: {
          exit: ['markCollectedKycData'],
          on: {
            requirementCompleted: {
              target: 'checkRequirements',
            },
          },
        },
        transfer: {
          on: {
            requirementCompleted: {
              target: 'checkRequirements',
            },
          },
        },
        liveness: {
          on: {
            requirementCompleted: {
              target: 'checkRequirements',
            },
          },
        },
        idDoc: {
          on: {
            requirementCompleted: {
              target: 'checkRequirements',
            },
          },
        },
        authorize: {
          on: {
            requirementCompleted: {
              target: 'checkRequirements',
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
