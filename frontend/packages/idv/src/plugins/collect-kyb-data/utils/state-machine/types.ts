import type {
  BusinessDI,
  BusinessDIData,
  CollectKybDataRequirement,
  CollectKycDataRequirement,
  PublicOnboardingConfig,
} from '@onefootprint/types';

import type { BusinessData, UserData } from '../../../../types';
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
  bootstrapUserData: UserData;
  bootstrapBusinessData: BusinessData;
  idvContext: CommonIdvContext;
  config?: PublicOnboardingConfig;
  // Machine generated
  data: BusinessDIData;
};

export type MachineEvents =
  | { type: 'basicDataSubmitted'; payload: BasicData }
  | { type: 'beneficialOwnerKycSubmitted' }
  | { type: 'beneficialOwnersSubmitted'; payload: BeneficialOwnersData }
  | { type: 'businessAddressSubmitted'; payload: BusinessAddressData }
  | { type: 'businessDataLoadError' }
  | { type: 'businessDataLoadSuccess'; payload: Partial<Omit<BasicData, BusinessDI.tin>> }
  | { type: 'confirmed' }
  | { type: 'editBasicData' }
  | { type: 'editBeneficialOwners' }
  | { type: 'editBusinessAddress' }
  | { type: 'introductionCompleted' }
  | { type: 'navigatedToPrevPage' }
  | { type: 'returnToSummary' }
  | { type: 'stepUpAuthTokenCompleted'; payload: string }
  | { type: 'stepUpDecryptionCompleted'; payload: BusinessDIData };
