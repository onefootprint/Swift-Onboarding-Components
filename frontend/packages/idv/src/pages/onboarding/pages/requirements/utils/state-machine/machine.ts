import type { IdDocOutcome, OverallOutcome, PublicOnboardingConfig } from '@onefootprint/types';
import { OnboardingRequirementKind } from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import { getRequirements } from '@onefootprint/types/src/api/onboarding-status';
import type { BootstrapBusinessData, UserData } from '../../../../../../types';
import { getLogger } from '../../../../../../utils/logger';
import type { CommonIdvContext } from '../../../../../../utils/state-machine';
import isRepeatRequirement from '../is-repeat-requirement';
import {
  NextRequirementTargets,
  RequirementCompletedTransition,
  getPreferUploadDoc,
  shouldWaitForComponentsSdk,
} from './machine.utils';
import type { MachineContext, MachineEvents } from './types';

export type OnboardingRequirementsMachineArgs = {
  config: PublicOnboardingConfig;
  idvContext: CommonIdvContext;
  bootstrapData: UserData & BootstrapBusinessData;
  idDocOutcome?: IdDocOutcome;
  overallOutcome?: OverallOutcome;
  isTransferFromDesktopToMobileDisabled?: boolean;
};

const { logError } = getLogger({ location: 'onboarding-requirements' });

const createOnboardingRequirementsMachine = ({
  config,
  bootstrapData,
  idvContext,
  idDocOutcome,
  overallOutcome,
  isTransferFromDesktopToMobileDisabled,
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
        continueOnMobile: false,
        idvContext,
        onboardingContext: {
          config,
          bootstrapData,
          idDocOutcome,
          overallOutcome,
        },
        requirements: [],
        isRequirementRouterVisited: false,
        isTransferFromDesktopToMobileDisabled,
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
              actions: ['assignMissingRequirements'],
            },
          },
        },
        router: {
          always: NextRequirementTargets,
          exit: ['setRequirementRouterVisited'], // The first time (and every time after) leaving router, mark data collection as started
        },
        kybData: {
          // Since we also collect KYC data inside the KYB plugin, mark KYC data collected
          exit: ['setKycDataCollected', 'setKybDataCollected', 'markLastHandledRequirement'],
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
          exit: ['setTransferVisited'],
          on: {
            ...RequirementCompletedTransition,
            continueOnDesktop: {
              actions: 'setContinueOnDesktop',
            },
          },
        },
        liveness: {
          exit: ['markLastHandledRequirement'],
          on: RequirementCompletedTransition,
        },
        idDoc: {
          exit: ['markLastHandledRequirement'],
          on: {
            ...RequirementCompletedTransition,
            continueOnMobile: {
              target: 'checkRequirements',
              actions: 'setContinueOnMobile',
            },
          },
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
        assignMissingRequirements: assign((ctx, event) => {
          const isRepeat = isRepeatRequirement(ctx.lastHandledRequirement, event.payload[0]);
          if (isRepeat) {
            const requirements = JSON.stringify({
              lastRequirement: ctx.lastHandledRequirement,
              nextRequirement: event.payload[0],
            });
            logError(`User is stuck on a requirement: ${requirements}`);
          }
          return {
            ...ctx,
            requirements: [...event.payload],
          };
        }),
        setTransferVisited: assign(ctx => ({ ...ctx, isTransferVisited: true })),
        markLastHandledRequirement: assign(ctx => {
          let lastHandledRequirement = ctx.requirements[0];
          if (lastHandledRequirement.kind === OnboardingRequirementKind.document) {
            const idDocReqs = getRequirements(ctx.requirements, OnboardingRequirementKind.document);
            lastHandledRequirement = getPreferUploadDoc(idDocReqs) || idDocReqs[0];
          }
          return { ...ctx, lastHandledRequirement };
        }),
        setInvestorProfileCollected: assign(ctx => ({ ...ctx, isInvestorProfileCollected: true })),
        setKycDataCollected: assign(ctx => ({ ...ctx, isKycDataCollected: true })),
        setKybDataCollected: assign(ctx => ({ ...ctx, isKybDataCollected: true })),
        setRequirementRouterVisited: assign(ctx => ({ ...ctx, isRequirementRouterVisited: true })),
        setContinueOnMobile: assign(ctx => ({ ...ctx, continueOnMobile: true })),
        setContinueOnDesktop: assign(ctx => ({ ...ctx, continueOnMobile: false })),
      },
    },
  );

export default createOnboardingRequirementsMachine;
