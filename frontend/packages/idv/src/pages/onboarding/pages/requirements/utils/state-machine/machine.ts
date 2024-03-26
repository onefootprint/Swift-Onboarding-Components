import type {
  IdDocOutcome,
  IdvBootstrapData,
  OverallOutcome,
  PublicOnboardingConfig,
} from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import type { DeviceInfo } from '../../../../../../hooks/ui/use-device-info';
import {
  NextRequirementTargets,
  RequirementCompletedTransition,
} from './machine.utils';
import type { MachineContext, MachineEvents } from './types';

export type OnboardingRequirementsMachineArgs = {
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
      on: {
        error: {
          target: 'error',
        },
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
          always: NextRequirementTargets,
          // The first time (and every time after) leaving router, mark data collection as started
          exit: ['startDataCollection'],
        },
        kybData: {
          // Since we also collect KYC data inside the KYB plugin, mark KYC data collected
          exit: ['markCollectedKycData'],
          on: RequirementCompletedTransition,
        },
        investorProfile: {
          on: RequirementCompletedTransition,
        },
        kycData: {
          exit: ['markCollectedKycData'],
          on: RequirementCompletedTransition,
        },
        transfer: {
          exit: ['markDidRunTransfer'],
          on: RequirementCompletedTransition,
        },
        liveness: {
          on: RequirementCompletedTransition,
        },
        idDoc: {
          on: RequirementCompletedTransition,
        },
        authorize: {
          on: RequirementCompletedTransition,
        },
        process: {
          on: RequirementCompletedTransition,
        },
        error: {
          type: 'final',
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
