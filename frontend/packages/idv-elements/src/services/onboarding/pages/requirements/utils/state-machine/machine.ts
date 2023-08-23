import {
  IdDocOutcomes,
  IdvBootstrapData,
  OnboardingConfig,
} from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import type { DeviceInfo } from '../../../../../../hooks/ui/use-device-info';
import { RequirementTargets, requiresAdditionalInfo } from './machine.utils';
import { MachineContext, MachineEvents } from './types';

export type OnboardingRequirementsMachineArgs = {
  userFound: boolean;
  device: DeviceInfo;
  config: OnboardingConfig;
  authToken: string;
  bootstrapData?: IdvBootstrapData;
  isTransfer?: boolean;
  idDocOutcome?: IdDocOutcomes;
};

const createOnboardingRequirementsMachine = ({
  userFound,
  device,
  authToken,
  config,
  bootstrapData,
  isTransfer,
  idDocOutcome,
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
          bootstrapData,
          isTransfer,
          idDocOutcome,
        },
        requirements: [],
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
