import type {
  BusinessDI,
  BusinessDIData,
  CollectKybDataRequirement,
  CollectKycDataRequirement,
  PublicOnboardingConfig,
} from '@onefootprint/types';

import type { UserData } from '../../../../types';
import type { CommonIdvContext } from '../../../../utils/state-machine';

export type BasicData = Required<Pick<BusinessDIData, BusinessDI.name | BusinessDI.tin>> &
  Pick<
    BusinessDIData,
    BusinessDI.doingBusinessAs | BusinessDI.corporationType | BusinessDI.phoneNumber | BusinessDI.website
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
  kybRequirement: CollectKybDataRequirement;
  kycRequirement?: CollectKycDataRequirement;
  kycUserData: UserData;
  idvContext: CommonIdvContext;
  config?: PublicOnboardingConfig;
  // Machine generated
  data: BusinessDIData;
};

export type MachineEvents =
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
