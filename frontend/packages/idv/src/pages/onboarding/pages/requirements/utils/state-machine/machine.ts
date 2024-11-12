import type { IdDocOutcome, OverallOutcome, PublicOnboardingConfig } from '@onefootprint/types';
import { OnboardingRequirementKind } from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import type { BootstrapBusinessData, UserData } from '@/idv/types';
import { getLogger } from '@/idv/utils';
import type { CommonIdvContext } from '@/idv/utils/state-machine';
import { DocumentUploadSettings, getRequirements } from '@onefootprint/types/src/api/onboarding-status';
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
          actions: 'setError',
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
        createBusinessOnboarding: {
          exit: ['markLastHandledRequirement'],
          on: RequirementCompletedTransition,
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
          const currentRequirement = event.payload[0];
          const isRepeat = isRepeatRequirement(ctx.lastHandledRequirement, currentRequirement);
          const isPreferUpload =
            currentRequirement?.kind === OnboardingRequirementKind.document &&
            currentRequirement?.uploadSettings === DocumentUploadSettings.preferUpload;
          // when the playbook has the preferUpload setting, we show the button "continue on mobile", which moves the user to the handoff but the requirement is still the same
          // in this case, we don't want to log as an error
          if (isRepeat && !isPreferUpload) {
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
        setError: assign((ctx, event) => ({ ...ctx, error: event?.payload?.error })),
      },
    },
  );

export default createOnboardingRequirementsMachine;
