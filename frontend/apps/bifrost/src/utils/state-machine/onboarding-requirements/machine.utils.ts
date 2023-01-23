import { MachineContext, States } from './types';

type MachineTarget = {
  target: States;
  cond: (context: MachineContext) => boolean;
};

export const RequirementTargets: MachineTarget[] = [
  {
    target: States.kycData,
    cond: context => shouldRunCollectKycData(context),
  },
  {
    target: States.transfer,
    cond: context => shouldRunTransfer(context),
  },
  {
    target: States.idDoc,
    cond: context => shouldRunIdDoc(context),
  },
  {
    target: States.identityCheck,
    cond: context => shouldRunIdentityCheck(context),
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

const shouldRunCollectKycData = (context: MachineContext) =>
  context.requirements.kycData.length > 0;

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

const shouldRunIdentityCheck = (context: MachineContext) =>
  !!context.requirements.identityCheck;
