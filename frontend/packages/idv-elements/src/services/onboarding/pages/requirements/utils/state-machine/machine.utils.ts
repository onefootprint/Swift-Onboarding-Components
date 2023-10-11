import { getRequirement, OnboardingRequirementKind } from '@onefootprint/types';

import type { MachineContext } from './types';

type MachineTarget = {
  target: string;
  cond: (context: MachineContext) => boolean;
};

const isDocKind = (x: unknown) => x === OnboardingRequirementKind.idDoc;
const isLivenessKind = (x: unknown) =>
  x === OnboardingRequirementKind.registerPasskey;

// NOTE: the ordering of these targets actually dictates the order in which requirements are
// handled by the frontend
export const RequirementTargets: MachineTarget[] = [
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
];

export const requiresAdditionalInfo = (context: MachineContext) => {
  const {
    onboardingContext: { userFound, isTransfer },
    requirements,
    startedDataCollection,
  } = context;
  // If there's an unmet requirement after logging into an existing user, show a screen saying
  // we need to collect additional info
  const kyc = getRequirement(
    requirements,
    OnboardingRequirementKind.collectKycData,
  );
  const kyb = getRequirement(
    requirements,
    OnboardingRequirementKind.collectKybData,
  );
  const idDoc = getRequirement(requirements, OnboardingRequirementKind.idDoc);
  const liveness = getRequirement(
    requirements,
    OnboardingRequirementKind.registerPasskey,
  );
  const investorProfile = getRequirement(
    requirements,
    OnboardingRequirementKind.investorProfile,
  );
  return (
    !startedDataCollection &&
    userFound &&
    !isTransfer &&
    ((!!kyc && !kyc.isMet) ||
      !!idDoc ||
      !!liveness ||
      !!investorProfile ||
      !!kyb)
  );
};

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

const shouldRunIdDoc = (context: MachineContext) =>
  context.requirements[0]?.kind === OnboardingRequirementKind.idDoc;

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

const shouldRunTransfer = (context: MachineContext): boolean => {
  const {
    onboardingContext: {
      device: { type },
      isTransfer,
      config: { isNoPhoneFlow },
    },
    didRunTransfer,
    requirements,
  } = context;
  if (didRunTransfer || isNoPhoneFlow) return false;
  if (isTransfer) return false;

  const firstKind = requirements[0]?.kind;
  const nextRequirementIsLiveness = isLivenessKind(firstKind);
  const nextRequirementIsIdDoc = isDocKind(firstKind);

  if (type === 'mobile') {
    return nextRequirementIsLiveness;
  }

  const hasPendingDoc = requirements.some(x => !x.isMet && isDocKind(x.kind));

  return nextRequirementIsIdDoc || (nextRequirementIsLiveness && hasPendingDoc);
};
