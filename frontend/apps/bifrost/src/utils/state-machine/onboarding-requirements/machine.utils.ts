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
    requirements: { kycData, idDocRequestId, liveness },
    startedDataCollection,
  } = context;
  return (
    !startedDataCollection &&
    userFound &&
    (kycData.length > 0 || !!idDocRequestId || !!liveness)
  );
};

const shouldRunCollectKycData = (context: MachineContext) =>
  context.requirements.kycData.length > 0;

const shouldRunIdDoc = (context: MachineContext) => {
  const {
    requirements: { idDocRequestId },
    onboardingContext: {
      device: { type },
    },
  } = context;
  return !!idDocRequestId && type === 'mobile';
};

const shouldRunTransfer = (context: MachineContext) => {
  const {
    requirements: { idDocRequestId, liveness },
    onboardingContext: {
      device: { type },
    },
  } = context;
  if (type === 'mobile') {
    return !!liveness;
  }
  return !!idDocRequestId || !!liveness;
};

const shouldRunIdentityCheck = (context: MachineContext) =>
  !!context.requirements.identityCheck;
