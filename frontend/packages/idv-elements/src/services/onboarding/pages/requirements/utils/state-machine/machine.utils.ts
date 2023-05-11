import { MachineContext } from './types';

type MachineTarget = {
  target: string;
  cond: (context: MachineContext) => boolean;
};

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
];

export const requiresAdditionalInfo = (context: MachineContext) => {
  const {
    onboardingContext: { userFound, isTransfer },
    requirements: { kycData, idDoc, liveness },
    startedDataCollection,
  } = context;
  return (
    !startedDataCollection &&
    userFound &&
    !isTransfer &&
    (kycData.length > 0 || !!idDoc || !!liveness)
  );
};

const shouldRunCollectKybData = (context: MachineContext) =>
  context.requirements.kybData.length > 0;

const shouldRunCollectKycData = (context: MachineContext) =>
  context.requirements.kycData.length > 0;

const shouldRunCollectInvestorProfile = (context: MachineContext) =>
  context.requirements.investorProfile.length > 0;

const shouldRunLiveness = (context: MachineContext) => {
  const {
    requirements: { liveness },
  } = context;
  return !!liveness;
};

const shouldRunIdDoc = (context: MachineContext) => {
  const {
    requirements: { idDoc },
    onboardingContext: {
      device: { type },
    },
  } = context;
  return !!idDoc && type === 'mobile';
};

const shouldShowAuthorize = (context: MachineContext) => {
  const {
    requirements: { authorize },
    onboardingContext: { isTransfer },
  } = context;
  return !isTransfer && !!authorize;
};

const shouldRunTransfer = (context: MachineContext) => {
  const {
    requirements: { idDoc, liveness },
    onboardingContext: {
      device: { type },
      isTransfer,
    },
  } = context;
  if (isTransfer) {
    return false;
  }
  if (type === 'mobile') {
    return !!liveness;
  }
  return !!idDoc || !!liveness;
};
