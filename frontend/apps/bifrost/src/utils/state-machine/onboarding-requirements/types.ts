import { DeviceInfo } from '@onefootprint/hooks';
import {
  CollectedKycDataOption,
  OnboardingConfig,
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
  idDocRequestId?: string;
  selfie?: boolean;
  kycData: readonly CollectedKycDataOption[];
};

export type MachineContext = {
  onboardingContext: {
    userFound: boolean;
    config: OnboardingConfig;
    device: DeviceInfo;
    authToken: string;
  };
  startedDataCollection: boolean;
  requirements: Requirements;
  kycData: UserData; // Filled user data
};

export enum Events {
  onboardingRequirementsReceived = 'onboardingRequirementsReceived',
  requirementCompleted = 'requirementCompleted',
}

export enum Actions {
  assignRequirements = 'assignRequirements',
  startDataCollection = 'startDataCollection',
}

export type MachineEvents =
  | {
      type: Events.requirementCompleted;
    }
  | {
      type: Events.onboardingRequirementsReceived;
      payload: Requirements;
    };
