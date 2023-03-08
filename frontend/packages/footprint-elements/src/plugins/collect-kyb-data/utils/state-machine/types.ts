import { DeviceInfo } from '@onefootprint/hooks';
import {
  BeneficialOwner,
  BusinessDataAttribute,
  OnboardingConfig,
} from '@onefootprint/types';

export type BusinessData = Partial<{
  [BusinessDataAttribute.name]: string;
  [BusinessDataAttribute.ein]: string;
  [BusinessDataAttribute.beneficialOwners]: BeneficialOwner[];
  [BusinessDataAttribute.addressLine1]: string;
  [BusinessDataAttribute.addressLine2]: string;
  [BusinessDataAttribute.city]: string;
  [BusinessDataAttribute.state]: string;
  [BusinessDataAttribute.country]: string;
  [BusinessDataAttribute.zip]: number;
}>;

export type MachineContext = {
  device?: DeviceInfo;
  authToken?: string;
  config?: OnboardingConfig;
  missingAttributes: BusinessDataAttribute[];
  data: BusinessData;
};

export type MachineEvents =
  | {
      type: 'receivedContext';
      payload: {
        authToken: string;
        device: DeviceInfo;
        config: OnboardingConfig;
        missingAttributes: BusinessDataAttribute[];
      };
    }
  | {
      type: 'introductionCompleted';
    }
  | {
      type: 'basicDataSubmitted';
    }
  | {
      type: 'businessAddressSubmitted';
    }
  | {
      type: 'beneficialOwnersSubmitted';
    }
  | {
      type: 'navigatedToPrevPage';
    }
  | {
      type: 'confirmed';
    };
