import { DeviceInfo } from '@onefootprint/hooks';
import {
  BusinessDI,
  BusinessDIData,
  CollectedKybDataOption,
  CollectedKycDataOption,
  OnboardingConfig,
} from '@onefootprint/types';

export type BasicData = Required<
  Pick<BusinessDIData, BusinessDI.name | BusinessDI.tin>
> &
  Pick<
    BusinessDIData,
    BusinessDI.doingBusinessAs | BusinessDI.phoneNumber | BusinessDI.website
  >;

export type BusinessAddressData = Required<
  Pick<
    BusinessDIData,
    | BusinessDI.addressLine1
    | BusinessDI.addressLine2
    | BusinessDI.city
    | BusinessDI.state
    | BusinessDI.country
    | BusinessDI.zip
  >
>;

export type BeneficialOwnersData =
  | Required<Pick<BusinessDIData, BusinessDI.beneficialOwners>>
  | Required<Pick<BusinessDIData, BusinessDI.kycedBeneficialOwners>>;

export type MachineContext = {
  // Plugin context
  missingKybAttributes: CollectedKybDataOption[];
  missingKycAttributes: CollectedKycDataOption[];
  device?: DeviceInfo;
  authToken?: string;
  config?: OnboardingConfig;
  userFound?: boolean;
  email?: string;
  phoneNumber?: string;
  // Machine generated
  data: BusinessDIData;
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
        phoneNumber?: string;
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
