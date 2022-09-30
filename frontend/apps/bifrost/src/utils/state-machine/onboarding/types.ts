import { DeviceInfo } from '@onefootprint/hooks';
import { CollectedDataOption, TenantInfo, UserData } from '@onefootprint/types';

export enum States {
  // TODO: create the onboarding requirements machine for states below next
  additionalInfoRequired = 'additionalInfoRequired',
  onboardingVerification = 'onboardingVerification',
  initOnboarding = 'initOnboarding',
  onboardingComplete = 'onboardingComplete',

  // Plugins
  collectKycData = 'collectKycData',
  d2p = 'd2p',
  webAuthn = 'webAuthn',
  idScan = 'idScan',
}

export type MachineContext = {
  userFound: boolean;
  // TODO: update these requirements based on what is returned from the backend
  missingWebauthnCredentials: boolean;
  missingIdScan: boolean;
  missingAttributes: readonly CollectedDataOption[]; // Initial set of attributes received from /onboarding
  data: UserData; // Filled user data
  tenant: TenantInfo;
  device: DeviceInfo;
  authToken?: string;
  validationToken?: string;
};

export enum Events {
  // TODO: create the onboarding requirements machine for events below next
  additionalInfoRequired = 'additionalInfoRequired',
  onboardingVerificationCompleted = 'onboardingVerificationCompleted',
  onboardingStarted = 'onboardingStarted',

  // Plugin completion
  webAuthnCompleted = 'webAuthnCompleted',
  d2pCompleted = 'd2pCompleted',
  idScanCompleted = 'idScanCompleted',
  collectKycDataCompleted = 'collectKycDataCompleted',
}

export enum Actions {
  assignMissingAttributes = 'assignMissingAttributes',
  assignMissingWebauthnCredentials = 'assignMissingWebauthnCredentials',
  assignMissingIdScan = 'assignMissingIdScan',
  assignValidationToken = 'assignValidationToken',
}

export type MachineEvents =
  | {
      type: Events.onboardingVerificationCompleted;
      payload: {
        missingAttributes: readonly CollectedDataOption[];
        missingWebauthnCredentials: boolean;
        validationToken?: string;
        missingIdScan: boolean;
      };
    }
  | { type: Events.additionalInfoRequired }
  | { type: Events.onboardingStarted }
  | { type: Events.webAuthnCompleted }
  | { type: Events.d2pCompleted }
  | { type: Events.idScanCompleted }
  | { type: Events.collectKycDataCompleted };
