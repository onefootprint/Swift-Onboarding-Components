import type { IdDocOutcome, OverallOutcome, PublicOnboardingConfig } from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import type { BusinessData, UserData } from '../../../../../../types';
import { Logger } from '../../../../../../utils/logger';
import type { CommonIdvContext } from '../../../../../../utils/state-machine';
import isRepeatRequirement from '../is-repeat-requirement';
import { NextRequirementTargets, RequirementCompletedTransition, shouldWaitForComponentsSdk } from './machine.utils';
import type { MachineContext, MachineEvents } from './types';

export type OnboardingRequirementsMachineArgs = {
  config: PublicOnboardingConfig;
  idvContext: CommonIdvContext;
  bootstrapData: UserData & BusinessData;
  idDocOutcome?: IdDocOutcome;
  overallOutcome?: OverallOutcome;
  isTransferOnDesktopDisabled?: boolean;
};

const createOnboardingRequirementsMachine = ({
  config,
  bootstrapData,
  idvContext,
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
      initial: 'init',
      context: {
        idvContext,
        onboardingContext: {
          config,
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
        init: {
          always: [
            {
              target: 'startOnboarding',
              cond: ctx => !ctx.idvContext.isTransfer,
            },
            { target: 'checkRequirements' },
          ],
        },
        startOnboarding: {
          on: {
            initialized: [
              {
                target: 'waitForComponentsSdk',
                cond: shouldWaitForComponentsSdk,
                description:
                  'If we are running bifrost for the components SDK, wait for the components SDK to finish handling its requirements',
              },
              {
                target: 'checkRequirements',
              },
            ],
          },
        },
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
          exit: ['markCollectedKycData', 'markLastHandledRequirement'],
          on: RequirementCompletedTransition,
        },
        investorProfile: {
          exit: ['markLastHandledRequirement'],
          on: RequirementCompletedTransition,
        },
        kycData: {
          exit: ['markCollectedKycData', 'markLastHandledRequirement'],
          on: RequirementCompletedTransition,
        },
        waitForComponentsSdk: {
          on: RequirementCompletedTransition,
        },
        transfer: {
          exit: ['markDidRunTransfer'],
          on: RequirementCompletedTransition,
        },
        liveness: {
          exit: ['markLastHandledRequirement'],
          on: RequirementCompletedTransition,
        },
        idDoc: {
          exit: ['markLastHandledRequirement'],
          on: RequirementCompletedTransition,
        },
        authorize: {
          exit: ['markLastHandledRequirement'],
          on: RequirementCompletedTransition,
        },
        process: {
          exit: ['markLastHandledRequirement'],
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
        assignRequirements: assign((context, event) => {
          const isRepeat = isRepeatRequirement(context.lastHandledRequirement, event.payload[0]);
          if (isRepeat) {
            // If the highest priority requirement hasn't changed after a refetch, the user is
            // stuck on a screen
            Logger.error(`User is stuck on ${context.lastHandledRequirement?.kind} requirement`, {
              location: 'requirements',
            });
          }
          return {
            ...context,
            requirements: [...event.payload],
          };
        }),
        markLastHandledRequirement: assign(context => ({
          ...context,
          lastHandledRequirement: context.requirements[0],
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
