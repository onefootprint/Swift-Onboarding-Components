import { DeviceInfo } from '@onefootprint/hooks';
import { CollectedDataOption, TenantInfo, UserData } from '@onefootprint/types';

export enum States {
  checkOnboardingRequirements = 'checkOnboardingRequirements',
  additionalInfoRequired = 'additionalInfoRequired',
  collectKycData = 'collectKycData',
  d2p = 'd2p',
  webAuthn = 'webAuthn',
  idScan = 'idScan',
  success = 'success',
}

export type MachineContext = {
  userFound: boolean;
  missingLiveness: boolean;
  missingIdDocument: boolean;
  missingKycData: readonly CollectedDataOption[]; // Initial set of attributes received from /onboarding
  kycData: UserData; // Filled user data
  tenant: TenantInfo;
  device: DeviceInfo;
  authToken?: string;
};

export enum Events {
  onboardingRequirementsReceived = 'onboardingRequirementsReceived',
  additionalInfoRequired = 'additionalInfoRequired',
  webAuthnCompleted = 'webAuthnCompleted',
  d2pCompleted = 'd2pCompleted',
  idScanCompleted = 'idScanCompleted',
  collectKycDataCompleted = 'collectKycDataCompleted',
}

export enum Actions {
  assignMissingKycData = 'assignMissingKycData',
  assignMissingLiveness = 'assignMissingLiveness',
  assignMissingIdDocument = 'assignMissingIdDocument',
}

export type MachineEvents =
  | { type: Events.additionalInfoRequired }
  | {
      type: Events.onboardingRequirementsReceived;
      payload: {
        missingLiveness: boolean;
        missingIdDocument: boolean;
        missingKycData: readonly CollectedDataOption[];
      };
    }
  | { type: Events.webAuthnCompleted }
  | { type: Events.d2pCompleted }
  | { type: Events.idScanCompleted }
  | { type: Events.collectKycDataCompleted };
