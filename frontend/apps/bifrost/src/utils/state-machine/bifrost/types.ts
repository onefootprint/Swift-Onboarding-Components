import { DeviceInfo } from 'hooks';
import {
  IdentifyType,
  OnboardingData,
  TenantInfo,
  UserData,
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
  onboardingCompleted = 'done.invoke.onboarding',
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
  assignValidationToken = 'assignValidationToken',
  assignOnboardingData = 'assignOnboardingData',
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
  validationToken?: string;
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
      type: Events.onboardingCompleted;
      data: {
        onboardingData: UserData;
      };
    }
  | {
      type: Events.onboardingVerificationSucceeded;
      payload: {
        missingAttributes: readonly UserDataAttribute[];
        missingWebauthnCredentials: boolean;
        validationToken?: string;
      };
    }
  | {
      type: Events.deviceInfoIdentified;
      payload: DeviceInfo;
    }
  | {
      type: Events.sharedDataConfirmed;
      payload: {
        validationToken: string;
      };
    };
