import { DeviceInfo } from '@onefootprint/hooks';
import {
  BusinessData,
  BusinessDataAttribute,
  CollectedKybDataOption,
  CollectedKycDataOption,
  OnboardingConfig,
} from '@onefootprint/types';

export type BasicData = Required<
  Pick<BusinessData, BusinessDataAttribute.name | BusinessDataAttribute.tin>
> &
  Pick<
    BusinessData,
    BusinessDataAttribute.phoneNumber | BusinessDataAttribute.website
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
  // Plugin context
  missingKybAttributes: CollectedKybDataOption[];
  missingKycAttributes: CollectedKycDataOption[];
  device?: DeviceInfo;
  authToken?: string;
  config?: OnboardingConfig;
  userFound?: boolean;
  email?: string;
  // Machine generated
  data: BusinessData;
};

export type MachineEvents =
  | {
      type: 'receivedContext';
      payload: {
        missingKybAttributes: CollectedKybDataOption[];
        missingKycAttributes: CollectedKycDataOption[];
        authToken: string;
        device: DeviceInfo;
        config: OnboardingConfig;
        userFound: boolean;
        email?: string;
      };
    }
  | {
      type: 'introductionCompleted';
    }
  | {
      type: 'basicDataSubmitted';
      payload: BasicData;
    }
  | {
      type: 'businessAddressSubmitted';
      payload: BusinessAddressData;
    }
  | {
      type: 'beneficialOwnersSubmitted';
      payload: BeneficialOwnersData;
    }
  | { type: 'navigatedToPrevPage' }
  | { type: 'confirmed' }
  | { type: 'editBasicData' }
  | { type: 'editBusinessAddress' }
  | { type: 'editBeneficialOwners' }
  | { type: 'returnToSummary' }
  | { type: 'beneficialOwnerKycSubmitted' };
