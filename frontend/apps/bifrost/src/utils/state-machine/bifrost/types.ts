import { DeviceInfo } from '@onefootprint/hooks';
import {
  CollectedDataOption,
  IdentifyType,
  TenantInfo,
  UserData,
} from '@onefootprint/types';
import { OnboardingData } from 'src/utils/state-machine/types';

export enum States {
  init = 'Init',
  identify = 'identify',
  tenantInvalid = 'tenantInvalid',
  confirmAndAuthorize = 'confirmAndAuthorize',
  authenticationSuccess = 'authenticationSuccess',
  onboarding = 'onboarding',
  onboardingSuccess = 'onboardingSuccess',
  verificationSuccess = 'verificationSuccess',
}

export enum Events {
  tenantInfoRequestSucceeded = 'tenantInfoRequestSucceeded',
  tenantInfoRequestFailed = 'tenantInfoRequestFailed',
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
  assignOnboardingData = 'assignOnboardingData',
  assignValidationToken = 'assignValidationToken',
  assignMissingAttributes = 'assignMissingAttributes',
  assignMissingWebauthnCredentials = 'assignMissingWebauthnCredentials',
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
      payload: TenantInfo;
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
        missingWebauthnCredentials: boolean;
        missingAttributes: readonly CollectedDataOption[];
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
