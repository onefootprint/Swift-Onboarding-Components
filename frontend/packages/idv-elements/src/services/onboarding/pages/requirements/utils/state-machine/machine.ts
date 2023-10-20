import type {
  IdDocOutcome,
  IdvBootstrapData,
  OverallOutcome,
  PublicOnboardingConfig,
} from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import type { DeviceInfo } from '../../../../../../hooks/ui/use-device-info';
import { RequirementTargets, requiresAdditionalInfo } from './machine.utils';
import type { MachineContext, MachineEvents } from './types';

export type OnboardingRequirementsMachineArgs = {
  userFound: boolean;
  config: PublicOnboardingConfig;
  device: DeviceInfo;
  authToken: string;
  bootstrapData?: IdvBootstrapData;
  isTransfer?: boolean;
  idDocOutcome?: IdDocOutcome;
  overallOutcome?: OverallOutcome;
  isTransferOnDesktopDisabled?: boolean;
};

const createOnboardingRequirementsMachine = ({
  userFound,
  config,
  device,
  authToken,
  bootstrapData,
  isTransfer,
  idDocOutcome,
  overallOutcome,
  isTransferOnDesktopDisabled,
}: OnboardingRequirementsMachineArgs) =>
  createMachine(
    {
      predictableActionArguments: true,
      id: 'onboarding-requirements',
      schema: {
        context: {} as MachineContext,
        events: {} as MachineEvents,
      },
      // eslint-disable-next-line @typescript-eslint/consistent-type-imports
      tsTypes: {} as import('./machine.typegen').Typegen0,
      initial: 'checkRequirements',
      context: {
        onboardingContext: {
          userFound,
          config,
          device,
          authToken,
          isTransfer,
          bootstrapData,
          idDocOutcome,
          overallOutcome,
        },
        requirements: [],
        startedDataCollection: false,
        isTransferOnDesktopDisabled,
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
          // The first time (and every time after) leaving router, mark data collection as started
          exit: ['startDataCollection'],
        },
        additionalInfoRequired: {
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
          // Since we also collect KYC data inside the KYB plugin, mark KYC data collected
          exit: ['markCollectedKycData'],
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
          exit: ['markDidRunTransfer'],
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
        process: {
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
          requirements: [...event.payload],
        })),
        markDidRunTransfer: assign(context => ({
          ...context,
          didRunTransfer: true,
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
