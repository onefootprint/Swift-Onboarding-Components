import { MachineContext } from './types';

type MachineTarget = {
  target: string;
  cond: (context: MachineContext) => boolean;
};

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
    target: 'idDoc',
    cond: context => shouldRunIdDoc(context),
  },
];

export const requiresAdditionalInfo = (context: MachineContext) => {
  const {
    onboardingContext: { userFound },
    requirements: { kycData, idDoc, liveness },
    startedDataCollection,
  } = context;
  return (
    !startedDataCollection &&
    userFound &&
    (kycData.length > 0 || !!idDoc || !!liveness)
  );
};

const shouldRunCollectKybData = (context: MachineContext) =>
  context.requirements.kybData.length > 0;

const shouldRunCollectKycData = (context: MachineContext) =>
  context.requirements.kycData.length > 0;

const shouldRunCollectInvestorProfile = (context: MachineContext) =>
  context.requirements.investorProfile.length > 0;

const shouldRunIdDoc = (context: MachineContext) => {
  const {
    requirements: { idDoc },
    onboardingContext: {
      device: { type },
    },
  } = context;
  return !!idDoc && type === 'mobile';
};

const shouldRunTransfer = (context: MachineContext) => {
  const {
    requirements: { idDoc, liveness },
    onboardingContext: {
      device: { type },
    },
  } = context;
  if (type === 'mobile') {
    return !!liveness;
  }
  return !!idDoc || !!liveness;
};
