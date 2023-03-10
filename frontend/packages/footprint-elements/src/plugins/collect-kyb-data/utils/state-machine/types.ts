import { DeviceInfo } from '@onefootprint/hooks';
import {
  BusinessData,
  BusinessDataAttribute,
  CollectedKybDataOption,
  OnboardingConfig,
} from '@onefootprint/types';

export type BasicData = Required<
  Pick<BusinessData, BusinessDataAttribute.name | BusinessDataAttribute.ein>
>;

export type BusinessAddressData = Required<
  Pick<
    BusinessData,
    | BusinessDataAttribute.addressLine1
    | BusinessDataAttribute.addressLine2
    | BusinessDataAttribute.city
    | BusinessDataAttribute.state
    | BusinessDataAttribute.country
    | BusinessDataAttribute.zip
  >
>;

export type BeneficialOwnersData = Required<
  Pick<BusinessData, BusinessDataAttribute.beneficialOwners>
>;

export type MachineContext = {
  device?: DeviceInfo;
  authToken?: string;
  config?: OnboardingConfig;
  missingAttributes: CollectedKybDataOption[];
  data: BusinessData;
};

export type MachineEvents =
  | {
      type: 'receivedContext';
      payload: {
        authToken: string;
        device: DeviceInfo;
        config: OnboardingConfig;
        missingAttributes: CollectedKybDataOption[];
      };
    }
  | {
      type: 'introductionCompleted';
    }
  | {
      type: 'basicDataSubmitted';
      payload: {
        basicData: BasicData;
      };
    }
  | {
      type: 'businessAddressSubmitted';
      payload: {
        businessAddress: BusinessAddressData;
      };
    }
  | {
      type: 'beneficialOwnersSubmitted';
      payload: {
        beneficialOwners: BeneficialOwnersData;
      };
    }
  | {
      type: 'navigatedToPrevPage';
    }
  | {
      type: 'confirmed';
    };
