import { DeviceInfo } from '@onefootprint/hooks';
import { OnboardingConfig } from '@onefootprint/types';

export enum States {
  init = 'Init',
  identify = 'identify',
  configInvalid = 'configInvalid',
  authenticationSuccess = 'authenticationSuccess',
  onboarding = 'onboarding',
  success = 'success',
}

export enum Events {
  initContextUpdated = 'initContextUpdated',
  configRequestFailed = 'configRequestFailed',
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
  config?: OnboardingConfig;
  userFound?: boolean;
  validationToken?: string;
  bootstrapData?: BootstrapData;
};

export type BifrostEvent =
  | {
      type: Events.initContextUpdated;
      payload: {
        config?: OnboardingConfig;
        device?: DeviceInfo;
        bootstrapData?: BootstrapData;
      };
    }
  | {
      type: Events.configRequestFailed;
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
