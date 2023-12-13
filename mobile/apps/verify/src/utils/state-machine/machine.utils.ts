import {
  type OnboardingRequirement,
  getRequirement,
  OnboardingRequirementKind,
} from '@onefootprint/types';

import type { MachineContext, RequirementsReceivedEvent } from './types';

type MachineTarget = {
  target: string;
  cond?: (context: MachineContext, event: RequirementsReceivedEvent) => boolean;
  actions?: (context: MachineContext, event: RequirementsReceivedEvent) => void;
};

export const isRequirementCompatible = (
  requirements: OnboardingRequirement[],
): boolean => {
  const inCompatibleRequirements = requirements.filter(
    requirement =>
      requirement.kind === OnboardingRequirementKind.idDoc ||
      requirement.kind === OnboardingRequirementKind.collectKybData ||
      requirement.kind === OnboardingRequirementKind.investorProfile,
  );
  return inCompatibleRequirements.length === 0;
};

const assignKycRequirements = (
  context: MachineContext,
  event: RequirementsReceivedEvent,
) => {
  context.kyc.requirement = getRequirement(
    event.payload,
    OnboardingRequirementKind.collectKycData,
  );
};

// TODO: add the rest of the requirements
export const NextTargetsFromRequirement: MachineTarget[] = [
  {
    target: 'incompatibleRequirements',
    cond: (context, event) => !isRequirementCompatible(event.payload),
  },
  {
    target: 'basicInformation',
    cond: (context, event) =>
      event.payload.length > 0 &&
      event.payload[0].kind === OnboardingRequirementKind.collectKycData,
    actions: assignKycRequirements,
  },
  {
    target: 'liveness',
    cond: (context, event) =>
      event.payload.length > 0 &&
      event.payload[0].kind === OnboardingRequirementKind.liveness,
  },
  {
    target: 'process',
    cond: (context, event) =>
      event.payload.length > 0 &&
      event.payload[0].kind === OnboardingRequirementKind.process,
  },
  {
    target: 'completed',
    cond: (context, event) => event.payload.length === 0,
  },
  {
    target: 'incompatibleRequirements',
  },
];
