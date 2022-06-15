import { DataKind } from './data-kind';
import { OnboardingStatus } from './onboarding-status';

export type Onboarding = {
  footprintUserId: string;
  status: OnboardingStatus;
  populatedDataKinds: DataKind[];
  createdAt: string; // TODO rename this initiatedAt
  updatedAt: string;
};
