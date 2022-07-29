import { DeviceInfo } from 'footprint-ui/src/hooks/use-device-info';
import {
  IdentifyType,
  OnboardingData,
  TenantInfo,
  UserDataAttribute,
} from 'src/utils/state-machine/types';

export enum States {
  init = 'Init',
  identify = 'identify',
  tenantInvalid = 'tenantInvalid',
  confirmAndAuthorize = 'confirmAndAuthorize',
  authenticationSuccess = 'authenticationSuccess',
  onboardingVerification = 'onboardingVerification',
  onboarding = 'onboarding',
  onboardingSuccess = 'registrationSuccess',
  verificationSuccess = 'verificationSuccess',
}

export enum Events {
  tenantInfoRequestSucceeded = 'tenantInfoRequestSucceeded',
  tenantInfoRequestFailed = 'tenantInfoRequestFailed',
  onboardingVerificationSucceeded = 'onboardingVerificationSucceeded',
  sharedDataConfirmed = 'sharedDataConfirmed',
  authenticationFlowStarted = 'authenticationFlowStarted',
  authenticationSucceeded = 'authenticationSucceeded',
  deviceInfoIdentified = 'deviceInfoIdentified',
  identifyCompleted = 'done.invoke.identify',
}

export enum Actions {
  // Identify & Challenge
  assignIdentifyType = 'assignIdentifyType',
  assignEmail = 'assignEmail',
  assignPhone = 'assignPhone',
  assignUserFound = 'assignUserFound',
  assignAuthToken = 'assignAuthToken',
  assignDeviceInfo = 'assignDeviceInfo',
  assignTenantInfo = 'assignTenantInfo',

  // Onboarding
  assignMissingAttributes = 'assignMissingAttributes',
  assignMissingWebauthnCredentials = 'assignMissingWebAuthnCredentials',
}

export type BifrostContext = {
  authToken?: string;
  device: DeviceInfo;
  email: string;
  identifyType: IdentifyType;
  onboarding: OnboardingData;
  phone?: string;
  tenant: TenantInfo;
  userFound: boolean;
};

export type BifrostEvent =
  | { type: Events.authenticationFlowStarted }
  | {
      type: Events.tenantInfoRequestSucceeded;
      payload: {
        canAccessDataKinds: UserDataAttribute[];
        isLive: boolean;
        mustCollectDataKinds: UserDataAttribute[];
        name: string;
        orgName: string;
        pk: string;
      };
    }
  | {
      type: Events.tenantInfoRequestFailed;
    }
  | {
      type: Events.identifyCompleted;
      data: {
        authToken: string;
        email: string;
        phone?: string;
        userFound: boolean;
      };
    }
  | {
      type: Events.onboardingVerificationSucceeded;
      payload: {
        missingAttributes: readonly UserDataAttribute[];
        missingWebauthnCredentials: boolean;
      };
    }
  | {
      type: Events.deviceInfoIdentified;
      payload: DeviceInfo;
    }
  | { type: Events.sharedDataConfirmed };
