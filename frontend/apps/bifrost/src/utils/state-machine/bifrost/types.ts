import { DeviceInfo } from '@onefootprint/hooks';
import { IdentifyType, TenantInfo } from '@onefootprint/types';

export enum States {
  init = 'Init',
  identify = 'identify',
  tenantInvalid = 'tenantInvalid',
  authenticationSuccess = 'authenticationSuccess',
  onboarding = 'onboarding',
  success = 'success',
}

export enum Events {
  initContextUpdated = 'initContextUpdated',
  tenantInfoRequestFailed = 'tenantInfoRequestFailed',
  authenticationSucceeded = 'authenticationSucceeded',
  identifyCompleted = 'done.invoke.identify',
  onboardingCompleted = 'done.invoke.onboarding',
}

export enum Actions {
  assignInitContext = 'assignInitContext',
  assignUserFound = 'assignUserFound',
  assignAuthToken = 'assignAuthToken',
  assignValidationToken = 'assignValidationToken',
}

export type BootstrapData = {
  email?: string;
  phoneNumber?: string;
};

export type BifrostContext = {
  authToken?: string;
  device?: DeviceInfo;
  identifyType?: IdentifyType;
  tenant?: TenantInfo;
  userFound?: boolean;
  validationToken?: string;
  bootstrapData?: BootstrapData;
};

export type BifrostEvent =
  | {
      type: Events.initContextUpdated;
      payload: {
        tenant?: TenantInfo;
        device?: DeviceInfo;
        identifyType?: IdentifyType;
        bootstrapData?: BootstrapData;
      };
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
    };
