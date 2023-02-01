import { DeviceInfo } from '@onefootprint/hooks';
import { OnboardingConfig, OnboardingStatus } from '@onefootprint/types';

export enum States {
  initOnboarding = 'initOnboarding',
  onboardingRequirements = 'onboardingRequirements',
  authorize = 'authorize',
  success = 'success',
}

export type MachineContext = {
  userFound: boolean;
  config: OnboardingConfig;
  device: DeviceInfo;
  email?: string;
  authToken: string;
  validationToken?: string;
  status?: OnboardingStatus;
};

export enum Events {
  onboardingInitialized = 'onboardingInitialized',
  onboardingRequirementsCompleted = 'onboardingRequirementsCompleted',
  authorized = 'authorized',
}

export enum Actions {
  assignValidationToken = 'assignValidationToken',
  assignStatus = 'assignStatus',
}

export type MachineEvents =
  | {
      type: Events.onboardingInitialized;
      payload: {
        validationToken?: string;
      };
    }
  | {
      type: Events.onboardingRequirementsCompleted;
    }
  | {
      type: Events.authorized;
      payload: {
        validationToken: string;
        status: OnboardingStatus;
      };
    };
