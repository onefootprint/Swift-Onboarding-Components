import type {
  BusinessDI,
  BusinessDIData,
  CollectKybDataRequirement,
  CollectKycDataRequirement,
  PublicOnboardingConfig,
} from '@onefootprint/types';

import { StateValue } from 'xstate';
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
  /** Readonly object with bootstrapped ``id.*`` data */
  bootstrapUserData: Readonly<UserData>;
  /** Readonly object with bootstrapped ``business.*`` data */
  bootstrapBusinessData: Readonly<BusinessData>;
  idvContext: CommonIdvContext;
  config?: PublicOnboardingConfig;
  /** Object with ``business.*`` form data */
  data: BusinessDIData;
  /** Readonly object with decrypted ``business.*`` data */
  vaultBusinessData?: Readonly<BusinessDIData>;
  dataCollectionScreensToShow: StateValue[];
};

export type LoadSuccessEvent = {
  type: 'businessDataLoadSuccess';
  payload: { data: BusinessDIData; vaultBusinessData: BusinessDIData };
};

export type MachineEvents =
  | { type: 'basicDataSubmitted'; payload: BusinessDIData }
  | { type: 'beneficialOwnerKycSubmitted' }
  | { type: 'beneficialOwnersSubmitted'; payload: BeneficialOwnersData }
  | { type: 'businessAddressSubmitted'; payload: BusinessAddressData }
  | { type: 'businessDataLoadError' }
  | { type: 'confirmed' }
  | { type: 'introductionCompleted' }
  | { type: 'navigatedToPrevPage' }
  | { type: 'stepUpAuthTokenCompleted'; payload: string }
  | { type: 'stepUpDecryptionCompleted'; payload: BusinessDIData }
  | LoadSuccessEvent;
