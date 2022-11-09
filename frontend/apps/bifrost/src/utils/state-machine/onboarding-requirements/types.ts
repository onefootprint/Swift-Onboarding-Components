import { DeviceInfo } from '@onefootprint/hooks';
import {
  CollectedKycDataOption,
  TenantInfo,
  UserData,
} from '@onefootprint/types';

export enum States {
  checkOnboardingRequirements = 'checkOnboardingRequirements',
  router = 'router',
  additionalInfoRequired = 'additionalInfoRequired',
  kycData = 'kycData',
  transfer = 'transfer',
  idDoc = 'idDoc',
  identityCheck = 'identityCheck',
  success = 'success',
}

export type Requirements = {
  identityCheck: boolean;
  liveness: boolean;
  idDoc: boolean;
  kycData: readonly CollectedKycDataOption[];
};

export type MachineContext = {
  onboardingContext: {
    userFound: boolean;
    tenant: TenantInfo;
    device: DeviceInfo;
    authToken: string;
  };
  requirements: Requirements;
  receivedRequirements: Requirements;
  kycData: UserData; // Filled user data
};

export enum Events {
  onboardingRequirementsReceived = 'onboardingRequirementsReceived',
  additionalInfoRequired = 'additionalInfoRequired',
  requirementCompleted = 'requirementCompleted',
}

export enum Actions {
  assignRequirements = 'assignRequirements',
  startKycData = 'startKycData',
  startTransfer = 'startTransfer',
  startIdDoc = 'startIdDoc',
  startIdentityCheck = 'startIdentityCheckRequirement',
}

export type MachineEvents =
  | { type: Events.additionalInfoRequired }
  | {
      type: Events.requirementCompleted;
    }
  | {
      type: Events.onboardingRequirementsReceived;
      payload: Requirements;
    };
