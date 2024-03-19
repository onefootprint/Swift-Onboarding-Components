import { OnboardingRequirementKind } from '@onefootprint/types';
import type { TransitionConfig, TransitionsConfig } from 'xstate';

import { checkIsInIframe } from '../../../../../../utils';
import type { MachineContext, MachineEvents } from './types';

export const RequirementCompletedTransition: TransitionsConfig<
  MachineContext,
  MachineEvents
> = {
  requirementCompleted: {
    target: 'checkRequirements',
  },
};

// NOTE: the ordering of these targets actually dictates the order in which requirements are
// handled by the frontend
export const NextRequirementTargets: TransitionConfig<
  MachineContext,
  MachineEvents
>[] = [
  {
    target: 'kybData',
    cond: context => shouldRunCollectKybData(context),
  },
  {
    target: 'kycData',
    cond: context => shouldRunCollectKycData(context),
  },
  {
    target: 'investorProfile',
    cond: context => shouldRunCollectInvestorProfile(context),
  },
  {
    target: 'transfer',
    cond: context => shouldRunTransfer(context),
  },
  {
    target: 'liveness',
    cond: context => shouldRunLiveness(context),
  },
  {
    target: 'idDoc',
    cond: context => shouldRunIdDoc(context),
  },
  {
    target: 'authorize',
    cond: context => shouldShowAuthorize(context),
  },
  {
    target: 'process',
    cond: context => shouldShowProcess(context),
  },
  {
    target: 'success',
  },
];

const shouldRunCollectKybData = (context: MachineContext) =>
  context.requirements[0]?.kind === OnboardingRequirementKind.collectKybData &&
  !context.onboardingContext.isTransfer;

const shouldRunCollectKycData = (context: MachineContext) =>
  context.requirements[0]?.kind === OnboardingRequirementKind.collectKycData &&
  !context.onboardingContext.isTransfer;

const shouldRunCollectInvestorProfile = (context: MachineContext) =>
  context.requirements[0]?.kind === OnboardingRequirementKind.investorProfile &&
  !context.onboardingContext.isTransfer;

const shouldRunLiveness = (context: MachineContext) =>
  context.requirements[0]?.kind === OnboardingRequirementKind.registerPasskey;

const shouldRunIdDoc = (context: MachineContext) => {
  const {
    onboardingContext: { isTransfer, device },
  } = context;
  const isMobile = device.type === 'mobile' || device.type === 'tablet';
  if (isTransfer && !isMobile) {
    // If we're running the transfer app on desktop, we want to keep the transfer as small as
    // possible. So, only register the passkey, don't allow also uploading id doc in desktop transfer
    return false;
  }
  return context.requirements[0]?.kind === OnboardingRequirementKind.idDoc;
};

const shouldShowAuthorize = (context: MachineContext) => {
  const {
    onboardingContext: { isTransfer },
  } = context;
  return (
    !isTransfer &&
    context.requirements[0]?.kind === OnboardingRequirementKind.authorize
  );
};

const shouldShowProcess = (context: MachineContext) => {
  const {
    onboardingContext: { isTransfer },
  } = context;
  return (
    !isTransfer &&
    context.requirements[0]?.kind === OnboardingRequirementKind.process
  );
};

const isDocKind = (x: unknown) => x === OnboardingRequirementKind.idDoc;
const isLivenessKind = (x: unknown) =>
  x === OnboardingRequirementKind.registerPasskey;

const shouldRunTransfer = (context: MachineContext): boolean => {
  const {
    onboardingContext: {
      isTransfer,
      config: { isNoPhoneFlow },
      device: { type: deviceType },
    },
    didRunTransfer,
    requirements,
    isTransferOnDesktopDisabled,
  } = context;
  const isMobile = deviceType === 'mobile';

  // When running natively (not in an iframe) on mobile, we can register the passkey without transferring.
  // If we're on desktop, we should still attempt to transfer
  if (!checkIsInIframe() && isMobile) return false;

  if (isTransferOnDesktopDisabled) return false;
  if (didRunTransfer) return false;
  if (isNoPhoneFlow) return false;
  if (isTransfer) return false;

  const firstKind = requirements[0]?.kind;
  const nextRequirementIsLiveness = isLivenessKind(firstKind);
  const nextRequirementIsIdDoc = isDocKind(firstKind);
  return nextRequirementIsIdDoc || nextRequirementIsLiveness;
};
