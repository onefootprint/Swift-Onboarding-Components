import { DeviceInfo } from '@onefootprint/hooks';
import { IdentifyType, TenantInfo } from '@onefootprint/types';

export enum States {
  init = 'Init',
  identify = 'identify',
  tenantInvalid = 'tenantInvalid',
  authenticationSuccess = 'authenticationSuccess',
  onboarding = 'onboarding',
  onboardingSuccess = 'onboardingSuccess',
  verificationSuccess = 'verificationSuccess',
}

export enum Events {
  tenantInfoRequestSucceeded = 'tenantInfoRequestSucceeded',
  tenantInfoRequestFailed = 'tenantInfoRequestFailed',
  authenticationFlowStarted = 'authenticationFlowStarted',
  authenticationSucceeded = 'authenticationSucceeded',
  deviceInfoIdentified = 'deviceInfoIdentified',
  identifyCompleted = 'done.invoke.identify',
  onboardingCompleted = 'done.invoke.onboarding',
}

export enum Actions {
  assignIdentifyType = 'assignIdentifyType',
  assignUserFound = 'assignUserFound',
  assignAuthToken = 'assignAuthToken',
  assignDeviceInfo = 'assignDeviceInfo',
  assignTenantInfo = 'assignTenantInfo',
  assignValidationToken = 'assignValidationToken',
}

export type BifrostContext = {
  authToken?: string;
  device?: DeviceInfo;
  identifyType: IdentifyType;
  tenant?: TenantInfo;
  userFound: boolean;
  validationToken?: string;
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
        userFound: boolean;
      };
    }
  | {
      type: Events.onboardingCompleted;
      data: {
        validationToken?: string;
      };
    }
  | {
      type: Events.deviceInfoIdentified;
      payload: DeviceInfo;
    };
