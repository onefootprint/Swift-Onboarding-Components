import type { IdDocOutcome, OverallOutcome, PublicOnboardingConfig } from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import type { BusinessData, UserData } from '../../../../../../types';
import { getLogger } from '../../../../../../utils/logger';
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

const { logError } = getLogger({ location: 'onboarding-requirements' });

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
          exit: ['setKycDataCollected', 'markLastHandledRequirement'],
          on: RequirementCompletedTransition,
        },
        investorProfile: {
          exit: ['setInvestorProfileCollected', 'markLastHandledRequirement'],
          on: RequirementCompletedTransition,
        },
        kycData: {
          exit: ['setKycDataCollected', 'markLastHandledRequirement'],
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
        assignRequirements: assign((ctx, event) => {
          const isRepeat = isRepeatRequirement(ctx.lastHandledRequirement, event.payload[0]);
          if (isRepeat) {
            // If the highest priority requirement hasn't changed after a refetch, the user is
            // stuck on a screen
            logError(`User is stuck on ${ctx.lastHandledRequirement?.kind} requirement`);
          }
          return {
            ...ctx,
            requirements: [...event.payload],
          };
        }),
        markDidRunTransfer: assign(ctx => ({ ...ctx, didRunTransfer: true })),
        markLastHandledRequirement: assign(ctx => ({ ...ctx, lastHandledRequirement: ctx.requirements[0] })),
        setInvestorProfileCollected: assign(ctx => ({ ...ctx, isInvestorProfileCollected: true })),
        setKycDataCollected: assign(ctx => ({ ...ctx, isKycDataCollected: true })),
        startDataCollection: assign(ctx => ({ ...ctx, startedDataCollection: true })),
      },
    },
  );

export default createOnboardingRequirementsMachine;
