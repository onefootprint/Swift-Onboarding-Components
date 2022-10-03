import { DeviceInfo } from '@onefootprint/hooks';
import { TenantInfo } from '@onefootprint/types';

export enum States {
  initOnboarding = 'initOnboarding',
  onboardingRequirements = 'onboardingRequirements',
  authorize = 'authorize',
  success = 'success',
}

export type MachineContext = {
  userFound: boolean;
  tenant: TenantInfo;
  device: DeviceInfo;
  authToken?: string;
  validationToken?: string;
};

export enum Events {
  onboardingInitialized = 'onboardingInitialized',
  onboardingRequirementsCompleted = 'onboardingRequirementsCompleted',
  authorized = 'authorized',
}

export enum Actions {
  assignValidationToken = 'assignValidationToken',
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
        validationToken?: string;
      };
    };
